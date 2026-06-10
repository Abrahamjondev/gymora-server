import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GymoraNotification } from '../../libs/dto/notification/notification';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import { NotificationService } from './notification.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';

@Resolver()
export class NotificationResolver {
	constructor(private readonly notificationService: NotificationService) {}

	@UseGuards(AuthGuard)
	@Mutation(() => GymoraNotification)
	public async createNotification(
		@Args('input') input: NotificationInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<GymoraNotification> {
		// input.memberId = receiver (social notifications: likes, comments, reviews);
		// falls back to self when omitted
		const receiverId = input.memberId ?? memberId.toString();
		return await this.notificationService.createNotification({ ...input, memberId: receiverId });
	}

	@UseGuards(AuthGuard)
	@Query(() => [GymoraNotification])
	public async getNotifications(@AuthMember('_id') memberId: ObjectId): Promise<GymoraNotification[]> {
		return await this.notificationService.getNotifications(memberId.toString());
	}

	@UseGuards(AuthGuard)
	@Mutation(() => GymoraNotification)
	public async markNotificationRead(
		@Args('notificationId') notificationId: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<GymoraNotification> {
		return await this.notificationService.markNotificationRead(notificationId, memberId.toString());
	}
}
