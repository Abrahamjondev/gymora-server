import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, Conversation, OnlineStatus } from '../../libs/dto/chat/chat';
import { ChatInput } from '../../libs/dto/chat/chat.input';

@Injectable()
export class ChatService {
	private readonly onlineMembers = new Set<string>();
	private readonly memberConnections = new Map<string, Set<string>>();
	// Last time a member went offline (in-memory, consistent with presence above).
	private readonly lastSeenMap = new Map<string, Date>();

	constructor(@InjectModel('Chat') private readonly chatModel: Model<Chat>) {}

	public async sendMessage(input: ChatInput): Promise<Chat> {
		const result = await this.chatModel.create(input);
		return result;
	}

	public async getMessageHistory(memberId: string, partnerId: string): Promise<Chat[]> {
		const mId = new Types.ObjectId(memberId);
		const pId = new Types.ObjectId(partnerId);
		const messages = await this.chatModel
			.find({
				$or: [
					{ senderId: mId, receiverId: pId },
					{ senderId: pId, receiverId: mId },
				],
			})
			.sort({ createdAt: 1 })
			.exec();

		// Mark incoming messages as read
		await this.chatModel.updateMany(
			{ senderId: pId, receiverId: mId, isRead: false },
			{ $set: { isRead: true } },
		);

		return messages;
	}

	/** Get all conversations for a member (inbox) */
	public async getConversations(memberId: string): Promise<Conversation[]> {
		const mId = new Types.ObjectId(memberId);

		// Aggregate: find unique partners and last message
		const result = await this.chatModel.aggregate([
			{
				$match: {
					$or: [{ senderId: mId }, { receiverId: mId }],
				},
			},
			{ $sort: { createdAt: -1 } },
			{
				$addFields: {
					partnerId: {
						$cond: {
							if: { $eq: ['$senderId', mId] },
							then: '$receiverId',
							else: '$senderId',
						},
					},
				},
			},
			{
				$group: {
					_id: '$partnerId',
					lastMessage: { $first: '$message' },
					lastMessageAt: { $first: '$createdAt' },
					isRead: {
						$first: {
							$cond: {
								if: { $eq: ['$receiverId', mId] },
								then: '$isRead',
								else: true,
							},
						},
					},
				},
			},
			{
				$lookup: {
					from: 'members',
					localField: '_id',
					foreignField: '_id',
					as: 'partnerData',
				},
			},
			{
				$project: {
					partnerId: { $toString: '$_id' },
					partnerNick: { $arrayElemAt: ['$partnerData.memberNick', 0] },
					partnerImage: { $arrayElemAt: ['$partnerData.memberImage', 0] },
					lastMessage: 1,
					lastMessageAt: 1,
					isRead: 1,
				},
			},
			{ $sort: { lastMessageAt: -1 } },
		]);

		return result.map((r: any) => ({
			partnerId: r.partnerId,
			partnerNick: r.partnerNick,
			partnerImage: r.partnerImage,
			lastMessage: r.lastMessage,
			lastMessageAt: r.lastMessageAt,
			isRead: r.isRead ?? true,
			isOnline: this.onlineMembers.has(r.partnerId),
		}));
	}

	/** Check if a specific member is online */
	public getPartnerOnlineStatus(partnerId: string): OnlineStatus {
		return {
			memberId: partnerId,
			isOnline: this.onlineMembers.has(partnerId),
			lastSeen: this.lastSeenMap.get(partnerId),
		};
	}

	public getConnectionIds(memberId: string): string[] {
		return Array.from(this.memberConnections.get(memberId) ?? []);
	}

	public getOnlineStatus(memberId: string): OnlineStatus {
		return { memberId, isOnline: this.onlineMembers.has(memberId), lastSeen: this.lastSeenMap.get(memberId) };
	}

	public setOnlineStatus(memberId: string, isOnline = true): OnlineStatus {
		if (isOnline) {
			this.onlineMembers.add(memberId);
		} else {
			this.onlineMembers.delete(memberId);
			// Stamp the moment they went offline for "last seen" display
			this.lastSeenMap.set(memberId, new Date());
		}
		return this.getOnlineStatus(memberId);
	}

	public registerConnection(memberId: string, socketId: string): OnlineStatus {
		const connections = this.memberConnections.get(memberId) ?? new Set<string>();
		connections.add(socketId);
		this.memberConnections.set(memberId, connections);
		return this.setOnlineStatus(memberId, true);
	}

	public unregisterConnection(memberId: string, socketId: string): OnlineStatus {
		const connections = this.memberConnections.get(memberId);
		if (!connections) return this.getOnlineStatus(memberId);
		connections.delete(socketId);
		if (connections.size) return this.getOnlineStatus(memberId);
		this.memberConnections.delete(memberId);
		return this.setOnlineStatus(memberId, false);
	}
}
