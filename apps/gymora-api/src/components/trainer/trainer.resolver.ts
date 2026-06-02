import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TrainerService } from './trainer.service';
import { Trainer, Trainers } from '../../libs/dto/trainer/trainer';
import { TrainerInput, TrainerUpdate, TrainersListInquiry } from '../../libs/dto/trainer/trainer.input';
import { AuthGuard } from '../auth/guards/auth.guard';
import { WithoutGuard } from '../auth/guards/without.guard';
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

	@UseGuards(WithoutGuard)
	@Query(() => Trainer)
	public async getTrainer(@Args('trainerId') trainerId: string, @AuthMember('_id') memberId: ObjectId): Promise<Trainer> {
		return await this.trainerService.getTrainer(memberId, trainerId);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Trainers)
	public async getTrainers(@Args('input') input: TrainersListInquiry): Promise<Trainers> {
		return await this.trainerService.getTrainers(input);
	}

	@Query(() => Trainer, { nullable: true })
	public async getTrainerByMemberId(@Args('memberId') memberId: string): Promise<Trainer | null> {
		return await this.trainerService.getTrainerByMemberId(memberId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Trainer)
	public async updateTrainer(@Args('input') input: TrainerUpdate, @AuthMember('_id') memberId: ObjectId): Promise<Trainer> {
		return await this.trainerService.updateTrainer(memberId.toString(), input);
	}
}
