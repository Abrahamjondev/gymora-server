import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsIn, Length, Min } from 'class-validator';
import { CourseCategory, CourseDifficulty } from '../../enums/gymora.enum';
import { Direction } from '../../enums/common.enum';

const availableCourseSorts = ['createdAt', 'coursePrice', 'courseRank', 'courseRating'];

@InputType()
class CourseSearch {
	@IsOptional()
	@Field(() => CourseCategory, { nullable: true })
	courseCategory?: CourseCategory;

	@IsOptional()
	@Field(() => CourseDifficulty, { nullable: true })
	courseDifficulty?: CourseDifficulty;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class CoursesInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableCourseSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => CourseSearch)
	search: CourseSearch;
}

@InputType()
export class CourseInput {
	@IsOptional()
	@Field(() => String, { nullable: true })
	trainerId?: string;
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
