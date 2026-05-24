import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Recommendation } from '../../libs/dto/recommendation/recommendation';
import { RecommendationInput } from '../../libs/dto/recommendation/recommendation.input';
import { RecommendationService } from './recommendation.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';

@Resolver()
export class RecommendationResolver {
	constructor(private readonly recommendationService: RecommendationService) {}

	@UseGuards(AuthGuard)
	@Query(() => [Recommendation])
	public async getRecommendations(
		@Args('input') input: RecommendationInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Recommendation[]> {
		return this.recommendationService.recommend({ ...input, memberId: memberId.toString() });
	}
}
