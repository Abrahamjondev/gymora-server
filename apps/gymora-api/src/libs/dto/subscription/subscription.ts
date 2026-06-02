import { Field, Float, ObjectType } from '@nestjs/graphql';
import { type ObjectId } from 'mongoose';
import { SubscriptionPlan, SubscriptionStatus } from '../../enums/gymora.enum';

@ObjectType()
export class Subscription {
	@Field(() => String)
	_id: ObjectId;
	@Field(() => String)
	memberId: ObjectId;
	@Field(() => String)
	paymentId: ObjectId;
	@Field(() => SubscriptionPlan)
	subscriptionPlan: SubscriptionPlan;
	@Field(() => SubscriptionStatus)
	subscriptionStatus: SubscriptionStatus;
	@Field(() => Date)
	startedAt: Date;
	@Field(() => Date)
	expiresAt: Date;
	@Field(() => Float)
	price: number;
	@Field(() => Date)
	createdAt: Date;
	@Field(() => Date)
	updatedAt: Date;
}
