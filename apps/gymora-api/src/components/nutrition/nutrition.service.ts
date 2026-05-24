import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MealLog, Nutrition } from '../../libs/dto/nutrition/nutrition';
import { MealLogInput } from '../../libs/dto/nutrition/nutrition.input';

@Injectable()
export class NutritionService {
	constructor(
		@InjectModel('Nutrition') private readonly nutritionModel: Model<Nutrition>,
		@InjectModel('MealLog') private readonly mealLogModel: Model<MealLog>,
	) {}

	public async addMealLog(input: MealLogInput): Promise<MealLog> {
		const meal = await this.mealLogModel.create(input);
		await this.nutritionModel.findOneAndUpdate(
			{ memberId: input.memberId, nutritionDate: input.mealDate },
			{
				$inc: {
					totalCalories: input.calories,
					totalProtein: input.protein ?? 0,
					totalCarbs: input.carbs ?? 0,
					totalFats: input.fats ?? 0,
				},
				$setOnInsert: { memberId: input.memberId, nutritionDate: input.mealDate },
			},
			{ upsert: true, new: true },
		);
		return meal;
	}

	public async getMealHistory(memberId: string): Promise<MealLog[]> {
		return await this.mealLogModel.find({ memberId }).sort({ mealDate: -1 }).exec();
	}

	public async getNutritionHistory(memberId: string): Promise<Nutrition[]> {
		return await this.nutritionModel.find({ memberId }).sort({ nutritionDate: -1 }).exec();
	}
}
