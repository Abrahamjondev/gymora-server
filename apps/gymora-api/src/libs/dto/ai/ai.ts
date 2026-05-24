import { Field, Float, ObjectType } from '@nestjs/graphql';
import { type ObjectId } from 'mongoose';

@ObjectType()
export class AIAnalyze {
	@Field(() => String)
	_id: ObjectId;
	@Field(() => String)
	memberId: ObjectId;
	@Field(() => String)
	imageUrl: string;
	@Field(() => String)
	foodName: string;
	@Field(() => Float)
	estimatedCalories: number;
	@Field(() => Float)
	protein: number;
	@Field(() => Float)
	carbs: number;
	@Field(() => Float)
	fats: number;
	@Field(() => String)
	aiProvider: string;
	@Field(() => String, { nullable: true })
	aiRawResult?: string;
	@Field(() => Date)
	createdAt: Date;
	@Field(() => Date)
	updatedAt: Date;
}
