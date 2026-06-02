import { Field, Float, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { PaymentProvider, SubscriptionPlan } from '../../enums/gymora.enum';

@InputType()
export class PaymentInput {
	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: string;
	@IsNotEmpty()
	@Min(0)
	@Field(() => Float)
	paymentAmount: number;
	@IsOptional()
	@Field(() => String, { nullable: true })
	paymentCurrency?: string;
	@IsNotEmpty()
	@IsEnum(SubscriptionPlan)
	@Field(() => SubscriptionPlan)
	subscriptionPlan: SubscriptionPlan;
	@IsNotEmpty()
	@IsEnum(PaymentProvider)
	@Field(() => PaymentProvider)
	paymentProvider: PaymentProvider;
	@IsOptional()
	@Field(() => String, { nullable: true })
	paymentNote?: string;
}
