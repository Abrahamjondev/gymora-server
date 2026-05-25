import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Workout } from '../../libs/dto/workout/workout';
import { WorkoutInput } from '../../libs/dto/workout/workout.input';
import { WorkoutService } from './workout.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { WithoutGuard } from '../auth/guards/without.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';

@Resolver()
export class WorkoutResolver {
	constructor(private readonly workoutService: WorkoutService) {}

	@UseGuards(AuthGuard)
	@Mutation(() => Workout)
	public async createWorkout(@Args('input') input: WorkoutInput, @AuthMember('_id') memberId: ObjectId): Promise<Workout> {
		return await this.workoutService.createWorkout({ ...input, memberId: memberId.toString() });
	}

	@UseGuards(WithoutGuard)
	@Query(() => Workout)
	public async getWorkout(@Args('workoutId') workoutId: string, @AuthMember('_id') memberId: ObjectId): Promise<Workout> {
		return await this.workoutService.getWorkout(memberId, workoutId);
	}

	@Query(() => [Workout])
	public async getWorkouts(): Promise<Workout[]> {
		return await this.workoutService.getWorkouts();
	}

	@UseGuards(AuthGuard)
	@Query(() => [Workout])
	public async getMemberWorkouts(@AuthMember('_id') memberId: ObjectId): Promise<Workout[]> {
		return await this.workoutService.getMemberWorkouts(memberId.toString());
	}
}
