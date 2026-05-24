import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MealLog, Nutrition } from '../../libs/dto/nutrition/nutrition';
import { MealLogInput } from '../../libs/dto/nutrition/nutrition.input';
import { NutritionService } from './nutrition.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';

@Resolver()
export class NutritionResolver {
	constructor(private readonly nutritionService: NutritionService) {}

	@UseGuards(AuthGuard)
	@Mutation(() => MealLog)
	public async addMealLog(@Args('input') input: MealLogInput, @AuthMember('_id') memberId: ObjectId): Promise<MealLog> {
		return await this.nutritionService.addMealLog({ ...input, memberId: memberId.toString() });
	}

	@UseGuards(AuthGuard)
	@Query(() => [MealLog])
	public async getMealHistory(@AuthMember('_id') memberId: ObjectId): Promise<MealLog[]> {
		return await this.nutritionService.getMealHistory(memberId.toString());
	}

	@UseGuards(AuthGuard)
	@Query(() => [Nutrition])
	public async getNutritionHistory(@AuthMember('_id') memberId: ObjectId): Promise<Nutrition[]> {
		return await this.nutritionService.getNutritionHistory(memberId.toString());
	}
}
