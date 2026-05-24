import { Field, Float, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';

@InputType()
export class ProgressInput {
	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: string;
	@IsNotEmpty()
	@Field(() => Date)
	progressDate: Date;
	@IsNotEmpty()
	@Min(1)
	@Field(() => Float)
	weight: number;
	@IsOptional()
	@Field(() => Float, { nullable: true })
	chest?: number;
	@IsOptional()
	@Field(() => Float, { nullable: true })
	waist?: number;
	@IsOptional()
	@Field(() => Float, { nullable: true })
	hips?: number;
	@IsOptional()
	@Field(() => Float, { nullable: true })
	bodyFat?: number;
	@IsOptional()
	@Field(() => [String], { nullable: true })
	progressPhotos?: string[];
	@IsOptional()
	@Field(() => String, { nullable: true })
	progressNote?: string;
}
