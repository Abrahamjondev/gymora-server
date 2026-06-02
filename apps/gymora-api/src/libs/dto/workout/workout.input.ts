import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsIn, IsOptional, Min } from 'class-validator';
import { WorkoutDifficulty } from '../../enums/gymora.enum';
import { Direction } from '../../enums/common.enum';

const availableWorkoutSorts = ['createdAt', 'workoutLikes', 'workoutViews', 'workoutRank', 'estimatedCaloriesBurned'];

@InputType()
class WorkoutSearch {
	@IsOptional()
	@Field(() => WorkoutDifficulty, { nullable: true })
	workoutDifficulty?: WorkoutDifficulty;

	@IsOptional()
	@Field(() => String, { nullable: true })
	targetMuscle?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;

	// Filter: only free workouts (public listing default)
	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	isFree?: boolean;
}

@InputType()
export class WorkoutsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableWorkoutSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => WorkoutSearch)
	search: WorkoutSearch;
}

@InputType()
export class WorkoutExerciseInput {
	@IsNotEmpty()
	@Field(() => String)
	exerciseName: string;
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	sets: number;
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	reps: number;
	@IsOptional()
	@Field(() => Int, { nullable: true })
	duration?: number;
}

@InputType()
export class WorkoutInput {
	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: string;
	@IsNotEmpty()
	@Field(() => String)
	workoutTitle: string;
	@IsOptional()
	@Field(() => String, { nullable: true })
	workoutDesc?: string;
	@IsNotEmpty()
	@Field(() => WorkoutDifficulty)
	workoutDifficulty: WorkoutDifficulty;
	@IsNotEmpty()
	@Field(() => String)
	targetMuscle: string;
	@IsOptional()
	@Field(() => Int, { nullable: true })
	estimatedCaloriesBurned?: number;
	@IsOptional()
	@Field(() => [WorkoutExerciseInput], { nullable: true })
	exercises?: WorkoutExerciseInput[];
	@IsOptional()
	@Field(() => String, { nullable: true })
	videoUrl?: string;
	@IsOptional()
	@Field(() => String, { nullable: true })
	workoutThumbnail?: string;
	// Freemium
	@IsOptional()
	@IsBoolean()
	@Field(() => Boolean, { nullable: true })
	isFree?: boolean;
	@IsOptional()
	@Field(() => String, { nullable: true })
	courseId?: string;
}

@InputType()
export class WorkoutUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: string;
	@IsOptional()
	@Field(() => String, { nullable: true })
	workoutTitle?: string;
	@IsOptional()
	@Field(() => String, { nullable: true })
	workoutDesc?: string;
	@IsOptional()
	@Field(() => WorkoutDifficulty, { nullable: true })
	workoutDifficulty?: WorkoutDifficulty;
	@IsOptional()
	@Field(() => String, { nullable: true })
	targetMuscle?: string;
	@IsOptional()
	@Field(() => Int, { nullable: true })
	estimatedCaloriesBurned?: number;
	@IsOptional()
	@Field(() => String, { nullable: true })
	workoutThumbnail?: string;
	@IsOptional()
	@Field(() => String, { nullable: true })
	videoUrl?: string;
	@IsOptional()
	@IsBoolean()
	@Field(() => Boolean, { nullable: true })
	isFree?: boolean;
	@IsOptional()
	@Field(() => String, { nullable: true })
	courseId?: string;
	@IsOptional()
	@Field(() => [WorkoutExerciseInput], { nullable: true })
	exercises?: WorkoutExerciseInput[];
}
