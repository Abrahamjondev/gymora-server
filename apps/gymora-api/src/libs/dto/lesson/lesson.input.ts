import { Field, InputType, Int, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';

@InputType()
export class LessonInput {
	@IsNotEmpty()
	@Field(() => String)
	courseId: string;

	@IsNotEmpty()
	@Field(() => String)
	title: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	description?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	videoUrl?: string;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	weekNumber: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	order: number;

	@IsOptional()
	@Min(0)
	@Field(() => Float, { nullable: true })
	duration?: number;
}

@InputType()
export class LessonUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	title?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	description?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	videoUrl?: string;

	@IsOptional()
	@Min(1)
	@Field(() => Int, { nullable: true })
	weekNumber?: number;

	@IsOptional()
	@Min(1)
	@Field(() => Int, { nullable: true })
	order?: number;

	@IsOptional()
	@Min(0)
	@Field(() => Float, { nullable: true })
	duration?: number;
}
