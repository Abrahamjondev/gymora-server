import { Field, Float, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';
import { SubscriptionPlan } from '../../enums/gymora.enum';

@InputType()
export class SubscriptionInput {
	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: string;
	@IsNotEmpty()
	@Field(() => String)
	paymentId: string;
	@IsNotEmpty()
	@Field(() => SubscriptionPlan)
	subscriptionPlan: SubscriptionPlan;
	@IsNotEmpty()
	@Min(0)
	@Field(() => Float)
	price: number;
}
