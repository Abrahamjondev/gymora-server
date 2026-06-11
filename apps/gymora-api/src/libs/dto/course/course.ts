import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { type ObjectId } from 'mongoose';
import { CourseCategory, CourseDifficulty } from '../../enums/gymora.enum';
import { Lesson } from '../lesson/lesson';
import { MeLiked } from '../like/like';

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
	@Field(() => [Lesson], { nullable: true })
	lessons?: Lesson[];
	@Field(() => Float, { nullable: true })
	courseRating?: number;
	@Field(() => Int, { nullable: true })
	courseRatingCount?: number;
	@Field(() => Int, { nullable: true })
	courseLikes?: number;
	@Field(() => Int, { nullable: true })
	courseRank?: number;
	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];
	@Field(() => Date)
	createdAt: Date;
	@Field(() => Date)
	updatedAt: Date;
}

@ObjectType()
class CourseCounter {
	@Field(() => Int)
	total: number;
}

@ObjectType()
export class Courses {
	@Field(() => [Course])
	list: Course[];

	@Field(() => [CourseCounter])
	metaCounter: CourseCounter[];
}
