import { Field, ObjectType } from '@nestjs/graphql';
import { type ObjectId } from 'mongoose';

@ObjectType()
export class LessonProgress {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	memberId: ObjectId;

	@Field(() => String)
	courseId: ObjectId;

	@Field(() => String)
	lessonId: ObjectId;

	@Field(() => Boolean)
	isCompleted: boolean;

	@Field(() => Date, { nullable: true })
	completedAt?: Date;

	@Field(() => Date)
	unlockedAt: Date;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}
