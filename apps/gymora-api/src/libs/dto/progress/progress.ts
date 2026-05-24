import { Field, Float, ObjectType } from '@nestjs/graphql';
import { type ObjectId } from 'mongoose';

@ObjectType()
export class Progress {
	@Field(() => String)
	_id: ObjectId;
	@Field(() => String)
	memberId: ObjectId;
	@Field(() => Date)
	progressDate: Date;
	@Field(() => Float)
	weight: number;
	@Field(() => Float, { nullable: true })
	chest?: number;
	@Field(() => Float, { nullable: true })
	waist?: number;
	@Field(() => Float, { nullable: true })
	hips?: number;
	@Field(() => Float, { nullable: true })
	bodyFat?: number;
	@Field(() => [String])
	progressPhotos: string[];
	@Field(() => String, { nullable: true })
	progressNote?: string;
}
