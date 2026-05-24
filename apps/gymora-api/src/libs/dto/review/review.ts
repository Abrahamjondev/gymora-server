import { Field, Int, ObjectType } from '@nestjs/graphql';
import { type ObjectId } from 'mongoose';

@ObjectType()
export class Review {
	@Field(() => String)
	_id: ObjectId;
	@Field(() => String)
	memberId: ObjectId;
	@Field(() => String, { nullable: true })
	trainerId?: ObjectId;
	@Field(() => String, { nullable: true })
	courseId?: ObjectId;
	@Field(() => Int)
	reviewRating: number;
	@Field(() => String, { nullable: true })
	reviewText?: string;
	@Field(() => Date)
	createdAt: Date;
}
