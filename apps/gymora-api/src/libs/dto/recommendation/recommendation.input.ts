import { Field, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class RecommendationInput {
	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: string;
	@IsOptional()
	@Field(() => [String], { nullable: true })
	goals?: string[];
}
