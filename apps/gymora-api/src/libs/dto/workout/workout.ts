import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
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
	@Field(() => String, { nullable: true })
	videoUrl?: string;
	@Field(() => Float, { nullable: true })
	workoutRating?: number;
	@Field(() => Int, { nullable: true })
	workoutRatingCount?: number;
	@Field(() => Boolean)
	isFree: boolean;
	@Field(() => String, { nullable: true })
	courseId?: ObjectId;
	@Field(() => String, { nullable: true })
	workoutThumbnail?: string;
	@Field(() => Int, { nullable: true })
	workoutViews?: number;
	@Field(() => Int, { nullable: true })
	workoutLikes?: number;
	@Field(() => Int, { nullable: true })
	workoutRank?: number;
	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];
	@Field(() => Date)
	createdAt: Date;
	@Field(() => Date)
	updatedAt: Date;
}

@ObjectType()
class WorkoutCounter {
	@Field(() => Int)
	total: number;
}

@ObjectType()
export class Workouts {
	@Field(() => [Workout])
	list: Workout[];

	@Field(() => [WorkoutCounter])
	metaCounter: WorkoutCounter[];
}
