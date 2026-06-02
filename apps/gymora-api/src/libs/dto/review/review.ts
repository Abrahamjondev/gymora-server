import { Field, Int, ObjectType } from '@nestjs/graphql';
import { type ObjectId } from 'mongoose';

@ObjectType()
class ReviewMemberData {
	@Field(() => String)
	_id: ObjectId;
	@Field(() => String)
	memberNick: string;
	@Field(() => String, { nullable: true })
	memberImage?: string;
}

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
	@Field(() => String, { nullable: true })
	workoutId?: ObjectId;
	@Field(() => Int)
	reviewRating: number;
	@Field(() => String, { nullable: true })
	reviewText?: string;
	@Field(() => ReviewMemberData, { nullable: true })
	memberData?: ReviewMemberData;
	@Field(() => Date)
	createdAt: Date;
	@Field(() => Date)
	updatedAt: Date;
}
