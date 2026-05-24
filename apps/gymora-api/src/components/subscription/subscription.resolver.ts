import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Subscription } from '../../libs/dto/subscription/subscription';
import { SubscriptionInput } from '../../libs/dto/subscription/subscription.input';
import { SubscriptionService } from './subscription.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';

@Resolver()
export class SubscriptionResolver {
	constructor(private readonly subscriptionService: SubscriptionService) {}

	@UseGuards(AuthGuard)
	@Mutation(() => Subscription)
	public async createSubscription(
		@Args('input') input: SubscriptionInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Subscription> {
		return await this.subscriptionService.createSubscription({ ...input, memberId: memberId.toString() });
	}

	@UseGuards(AuthGuard)
	@Query(() => [Subscription])
	public async getMemberSubscriptions(@AuthMember('_id') memberId: ObjectId): Promise<Subscription[]> {
		return await this.subscriptionService.getMemberSubscriptions(memberId.toString());
	}
}
