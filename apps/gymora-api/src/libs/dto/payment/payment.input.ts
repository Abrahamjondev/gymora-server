import { Field, Float, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';

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
	@IsOptional()
	@Field(() => String, { nullable: true })
	paymentNote?: string;
}
