import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { CourseCategory, CourseDifficulty } from '../../enums/gymora.enum';

@InputType()
export class CourseInput {
	@IsNotEmpty()
	@Field(() => String)
	trainerId: string;
	@IsNotEmpty()
	@Length(3, 100)
	@Field(() => String)
	courseTitle: string;
	@IsOptional()
	@Field(() => String, { nullable: true })
	courseDesc?: string;
	@IsNotEmpty()
	@Field(() => CourseDifficulty)
	courseDifficulty: CourseDifficulty;
	@IsNotEmpty()
	@Field(() => CourseCategory)
	courseCategory: CourseCategory;
	@IsOptional()
	@Min(0)
	@Field(() => Float, { nullable: true })
	coursePrice?: number;
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	courseDuration: number;
	@IsOptional()
	@Field(() => String, { nullable: true })
	courseThumbnail?: string;
	@IsOptional()
	@Field(() => [String], { nullable: true })
	courseVideos?: string[];
}

@InputType()
export class CourseUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: string;
	@IsOptional()
	@Field(() => String, { nullable: true })
	courseTitle?: string;
	@IsOptional()
	@Field(() => String, { nullable: true })
	courseDesc?: string;
	@IsOptional()
	@Field(() => CourseDifficulty, { nullable: true })
	courseDifficulty?: CourseDifficulty;
	@IsOptional()
	@Field(() => CourseCategory, { nullable: true })
	courseCategory?: CourseCategory;
	@IsOptional()
	@Field(() => Float, { nullable: true })
	coursePrice?: number;
	@IsOptional()
	@Field(() => Int, { nullable: true })
	courseDuration?: number;
	@IsOptional()
	@Field(() => String, { nullable: true })
	courseThumbnail?: string;
	@IsOptional()
	@Field(() => [String], { nullable: true })
	courseVideos?: string[];
}
