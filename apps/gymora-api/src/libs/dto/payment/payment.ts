import { Field, Float, ObjectType } from '@nestjs/graphql';
import { type ObjectId } from 'mongoose';
import { PaymentProvider, PaymentStatus, SubscriptionPlan } from '../../enums/gymora.enum';

@ObjectType()
export class Payment {
	@Field(() => String)
	_id: ObjectId;
	@Field(() => String)
	memberId: ObjectId;
	@Field(() => Float)
	paymentAmount: number;
	@Field(() => String)
	paymentCurrency: string;
	@Field(() => PaymentStatus)
	paymentStatus: PaymentStatus;
	@Field(() => SubscriptionPlan, { nullable: true })
	subscriptionPlan?: SubscriptionPlan;
	@Field(() => String, { nullable: true })
	transactionId?: string;
	@Field(() => PaymentProvider)
	paymentProvider: PaymentProvider;
	@Field(() => String, { nullable: true })
	paymentNote?: string;
	@Field(() => Date)
	createdAt: Date;
	@Field(() => Date)
	updatedAt: Date;
}

@ObjectType()
export class PaymentInitiateResult {
	@Field(() => String)
	paymentId: string;
	@Field(() => PaymentProvider)
	provider: PaymentProvider;
	@Field(() => String, { nullable: true })
	clientSecret?: string;
	@Field(() => String, { nullable: true })
	redirectUrl?: string;
}
