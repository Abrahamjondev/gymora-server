import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';
import { WorkoutDifficulty } from '../../enums/gymora.enum';

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
}
