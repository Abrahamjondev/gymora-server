import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Progress } from '../../libs/dto/progress/progress';
import { ProgressInput } from '../../libs/dto/progress/progress.input';
import { ProgressService } from './progress.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';

@Resolver()
export class ProgressResolver {
	constructor(private readonly progressService: ProgressService) {}

	@UseGuards(AuthGuard)
	@Mutation(() => Progress)
	public async addProgress(@Args('input') input: ProgressInput, @AuthMember('_id') memberId: ObjectId): Promise<Progress> {
		return await this.progressService.addProgress({ ...input, memberId: memberId.toString() });
	}

	@UseGuards(AuthGuard)
	@Query(() => [Progress])
	public async getProgressTimeline(@AuthMember('_id') memberId: ObjectId): Promise<Progress[]> {
		return await this.progressService.getProgressTimeline(memberId.toString());
	}
}
