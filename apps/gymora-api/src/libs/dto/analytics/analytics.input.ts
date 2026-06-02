import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, Min } from 'class-validator';

@InputType()
export class AnalyticsInput {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Float)
	weightKg: number;
	@IsNotEmpty()
	@Min(1)
	@Field(() => Float)
	heightCm: number;
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	age: number;
	@IsNotEmpty()
	@Field(() => String)
	gender: string;

	@IsNotEmpty()
	@Field(() => String)
	activityLevel: string;
}
