import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Workout, Workouts } from '../../libs/dto/workout/workout';
import { WorkoutInput, WorkoutUpdate, WorkoutsInquiry } from '../../libs/dto/workout/workout.input';
import { WorkoutService } from './workout.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { WithoutGuard } from '../auth/guards/without.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';

@Resolver()
export class WorkoutResolver {
	constructor(private readonly workoutService: WorkoutService) {}

	@Roles(MemberType.TRAINER)
	@UseGuards(RolesGuard)
	@Mutation(() => Workout)
	public async createWorkout(
		@Args('input') input: WorkoutInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Workout> {
		return await this.workoutService.createWorkout({ ...input, memberId: memberId.toString() });
	}

	@UseGuards(WithoutGuard)
	@Query(() => Workout)
	public async getWorkout(
		@Args('workoutId') workoutId: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Workout> {
		return await this.workoutService.getWorkout(memberId, workoutId);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Workouts)
	public async getWorkouts(
		@Args('input') input: WorkoutsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Workouts> {
		return await this.workoutService.getWorkouts(input, memberId);
	}

	@Roles(MemberType.TRAINER)
	@UseGuards(RolesGuard)
	@Mutation(() => Workout)
	public async updateWorkout(
		@Args('input') input: WorkoutUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Workout> {
		return await this.workoutService.updateWorkout(memberId.toString(), input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Workout)
	public async likeWorkout(
		@Args('workoutId') workoutId: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Workout> {
		return await this.workoutService.likeWorkout(memberId, workoutId);
	}

	@UseGuards(AuthGuard)
	@Query(() => [Workout])
	public async getMemberWorkouts(@AuthMember('_id') memberId: ObjectId): Promise<Workout[]> {
		return await this.workoutService.getMemberWorkouts(memberId.toString());
	}

	@UseGuards(WithoutGuard)
	@Query(() => [Workout])
	public async getWorkoutsByMemberId(@Args('memberId') memberId: string): Promise<Workout[]> {
		return await this.workoutService.getWorkoutsByMemberId(memberId);
	}

	@Roles(MemberType.TRAINER)
	@UseGuards(RolesGuard)
	@Query(() => Int)
	public async getFreeWorkoutCount(@AuthMember('_id') memberId: ObjectId): Promise<number> {
		return await this.workoutService.getFreeWorkoutCount(memberId.toString());
	}

	/** ADMIN **/

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Workouts)
	public async getAllWorkoutsByAdmin(@Args('input') input: WorkoutsInquiry): Promise<Workouts> {
		console.log('Query getAllWorkoutsByAdmin');
		return await this.workoutService.getAllWorkoutsByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Workout)
	public async updateWorkoutByAdmin(@Args('input') input: WorkoutUpdate): Promise<Workout> {
		console.log('Mutation updateWorkoutByAdmin');
		return await this.workoutService.updateWorkoutByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Workout)
	public async deleteWorkoutByAdmin(@Args('workoutId') workoutId: string): Promise<Workout> {
		console.log('Mutation deleteWorkoutByAdmin');
		return await this.workoutService.deleteWorkoutByAdmin(workoutId);
	}
}
