import { Field, Int, ObjectType } from '@nestjs/graphql';
import { type ObjectId } from 'mongoose';
import { WorkoutDifficulty } from '../../enums/gymora.enum';
import { MeLiked } from '../like/like';

@ObjectType()
export class WorkoutExercise {
	@Field(() => String)
	exerciseName: string;
	@Field(() => Int)
	sets: number;
	@Field(() => Int)
	reps: number;
	@Field(() => Int, { nullable: true })
	duration?: number;
}

@ObjectType()
export class Workout {
	@Field(() => String)
	_id: ObjectId;
	@Field(() => String)
	memberId: ObjectId;
	@Field(() => String)
	workoutTitle: string;
	@Field(() => String, { nullable: true })
	workoutDesc?: string;
	@Field(() => WorkoutDifficulty)
	workoutDifficulty: WorkoutDifficulty;
	@Field(() => String)
	targetMuscle: string;
	@Field(() => Int)
	estimatedCaloriesBurned: number;
	@Field(() => [WorkoutExercise])
	exercises: WorkoutExercise[];
	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];
	@Field(() => Date)
	createdAt: Date;
	@Field(() => Date)
	updatedAt: Date;
}
