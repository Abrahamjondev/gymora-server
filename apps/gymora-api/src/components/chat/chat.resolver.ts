import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Chat, OnlineStatus } from '../../libs/dto/chat/chat';
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
		@Args('trainerMemberId') trainerMemberId: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Chat[]> {
		return await this.chatService.getMessageHistory(memberId.toString(), trainerMemberId);
	}

	@UseGuards(AuthGuard)
	@Query(() => OnlineStatus)
	public async getOnlineStatus(@AuthMember('_id') memberId: ObjectId): Promise<OnlineStatus> {
		return this.chatService.getOnlineStatus(memberId.toString());
	}
}
