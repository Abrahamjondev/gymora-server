import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TrainerService } from './trainer.service';
import { Trainer } from '../../libs/dto/trainer/trainer';
import { TrainerInput, TrainerUpdate } from '../../libs/dto/trainer/trainer.input';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';

@Resolver()
export class TrainerResolver {
	constructor(private readonly trainerService: TrainerService) {}

	@UseGuards(AuthGuard)
	@Mutation(() => Trainer)
	public async createTrainer(@Args('input') input: TrainerInput, @AuthMember('_id') memberId: ObjectId): Promise<Trainer> {
		return await this.trainerService.createTrainer({ ...input, memberId: memberId.toString() });
	}

	@Query(() => Trainer)
	public async getTrainer(@Args('trainerId') trainerId: string): Promise<Trainer> {
		return await this.trainerService.getTrainer(trainerId);
	}

	@Query(() => [Trainer])
	public async getTrainers(): Promise<Trainer[]> {
		return await this.trainerService.getTrainers();
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Trainer)
	public async updateTrainer(@Args('input') input: TrainerUpdate, @AuthMember('_id') memberId: ObjectId): Promise<Trainer> {
		return await this.trainerService.updateTrainer(memberId.toString(), input);
	}
}
