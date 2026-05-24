import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Max, Min } from 'class-validator';

@InputType()
export class ReviewInput {
	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: string;
	@IsOptional()
	@Field(() => String, { nullable: true })
	trainerId?: string;
	@IsOptional()
	@Field(() => String, { nullable: true })
	courseId?: string;
	@IsNotEmpty()
	@Min(1)
	@Max(5)
	@Field(() => Int)
	reviewRating: number;
	@IsOptional()
	@Field(() => String, { nullable: true })
	reviewText?: string;
}
