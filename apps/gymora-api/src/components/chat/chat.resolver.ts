import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Chat, Conversation, OnlineStatus } from '../../libs/dto/chat/chat';
import { ChatInput } from '../../libs/dto/chat/chat.input';
import { ChatService } from './chat.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';

@Resolver()
export class ChatResolver {
	constructor(private readonly chatService: ChatService) {}

	@UseGuards(AuthGuard)
	@Mutation(() => Chat)
	public async sendMessage(@Args('input') input: ChatInput, @AuthMember('_id') memberId: ObjectId): Promise<Chat> {
		return await this.chatService.sendMessage({ ...input, senderId: memberId.toString() });
	}

	@UseGuards(AuthGuard)
	@Query(() => [Chat])
	public async getMessageHistory(
		@Args('partnerId') partnerId: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Chat[]> {
		return await this.chatService.getMessageHistory(memberId.toString(), partnerId);
	}

	@UseGuards(AuthGuard)
	@Query(() => [Conversation])
	public async getConversations(@AuthMember('_id') memberId: ObjectId): Promise<Conversation[]> {
		return await this.chatService.getConversations(memberId.toString());
	}

	@UseGuards(AuthGuard)
	@Query(() => OnlineStatus)
	public async getOnlineStatus(@AuthMember('_id') memberId: ObjectId): Promise<OnlineStatus> {
		return this.chatService.getOnlineStatus(memberId.toString());
	}

	@UseGuards(AuthGuard)
	@Query(() => OnlineStatus)
	public async getPartnerOnlineStatus(@Args('partnerId') partnerId: string): Promise<OnlineStatus> {
		return this.chatService.getPartnerOnlineStatus(partnerId);
	}
}
