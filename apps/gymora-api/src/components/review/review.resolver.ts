import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Review } from '../../libs/dto/review/review';
import { ReviewInput } from '../../libs/dto/review/review.input';
import { ReviewService } from './review.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';

@Resolver()
export class ReviewResolver {
	constructor(private readonly reviewService: ReviewService) {}

	@UseGuards(AuthGuard)
	@Mutation(() => Review)
	public async createReview(
		@Args('input') input: ReviewInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Review> {
		return await this.reviewService.createReview({ ...input, memberId: memberId.toString() });
	}

	@Query(() => [Review])
	public async getTrainerReviews(@Args('trainerId') trainerId: string): Promise<Review[]> {
		return await this.reviewService.getTrainerReviews(trainerId);
	}

	@Query(() => [Review])
	public async getCourseReviews(@Args('courseId') courseId: string): Promise<Review[]> {
		return await this.reviewService.getCourseReviews(courseId);
	}

	@Query(() => [Review])
	public async getWorkoutReviews(@Args('workoutId') workoutId: string): Promise<Review[]> {
		return await this.reviewService.getWorkoutReviews(workoutId);
	}
}
