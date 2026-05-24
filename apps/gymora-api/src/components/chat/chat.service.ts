import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, OnlineStatus } from '../../libs/dto/chat/chat';
import { ChatInput } from '../../libs/dto/chat/chat.input';

@Injectable()
export class ChatService {
	private readonly onlineMembers = new Set<string>();
	private readonly memberConnections = new Map<string, Set<string>>();

	constructor(@InjectModel('Chat') private readonly chatModel: Model<Chat>) {}

	public async sendMessage(input: ChatInput): Promise<Chat> {
		return await this.chatModel.create(input);
	}

	public async getMessageHistory(memberId: string, trainerMemberId: string): Promise<Chat[]> {
		return await this.chatModel
			.find({
				$or: [
					{ senderId: memberId, receiverId: trainerMemberId },
					{ senderId: trainerMemberId, receiverId: memberId },
				],
			})
			.sort({ createdAt: 1 })
			.exec();
	}

	public getOnlineStatus(memberId: string): OnlineStatus {
		return { memberId, isOnline: this.onlineMembers.has(memberId) };
	}

	public setOnlineStatus(memberId: string, isOnline: boolean = true): OnlineStatus {
		if (isOnline) this.onlineMembers.add(memberId);
		else this.onlineMembers.delete(memberId);
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
