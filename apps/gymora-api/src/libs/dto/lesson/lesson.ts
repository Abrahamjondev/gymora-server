import { Field, Int, Float, ObjectType } from '@nestjs/graphql';
import { type ObjectId } from 'mongoose';

@ObjectType()
export class Lesson {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	courseId: ObjectId;

	@Field(() => String)
	title: string;

	@Field(() => String, { nullable: true })
	description?: string;

	@Field(() => String, { nullable: true })
	videoUrl?: string;

	@Field(() => Int)
	weekNumber: number;

	@Field(() => Int)
	order: number;

	@Field(() => Float)
	duration: number;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}
