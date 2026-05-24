import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { type ObjectId } from 'mongoose';
import { CourseCategory, CourseDifficulty } from '../../enums/gymora.enum';

@ObjectType()
export class Course {
	@Field(() => String)
	_id: ObjectId;
	@Field(() => String)
	trainerId: ObjectId;
	@Field(() => String)
	courseTitle: string;
	@Field(() => String, { nullable: true })
	courseDesc?: string;
	@Field(() => CourseDifficulty)
	courseDifficulty: CourseDifficulty;
	@Field(() => CourseCategory)
	courseCategory: CourseCategory;
	@Field(() => Float)
	coursePrice: number;
	@Field(() => Int)
	courseDuration: number;
	@Field(() => String, { nullable: true })
	courseThumbnail?: string;
	@Field(() => [String])
	courseVideos: string[];
	@Field(() => [String])
	purchasedMembers: ObjectId[];
	@Field(() => Date)
	createdAt: Date;
	@Field(() => Date)
	updatedAt: Date;
}
