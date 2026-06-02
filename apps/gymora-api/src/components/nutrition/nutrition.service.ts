import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MealLog, Nutrition } from '../../libs/dto/nutrition/nutrition';
import { MealLogInput } from '../../libs/dto/nutrition/nutrition.input';
import { NutritionRecommendationInput } from '../../libs/dto/nutrition/nutrition.recommendation.input';
import { MealSuggestion, NutritionRecommendation } from '../../libs/dto/nutrition/nutrition.recommendation';
import { ActivityLevel, FitnessGoal, Gender, MealType } from '../../libs/enums/gymora.enum';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
	[ActivityLevel.SEDENTARY]: 1.2,
	[ActivityLevel.LIGHTLY_ACTIVE]: 1.375,
	[ActivityLevel.MODERATELY_ACTIVE]: 1.55,
	[ActivityLevel.VERY_ACTIVE]: 1.725,
	[ActivityLevel.EXTRA_ACTIVE]: 1.9,
};

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

	public async deleteMealLog(memberId: string, mealLogId: string): Promise<MealLog> {
		const meal = await this.mealLogModel.findOneAndDelete({ _id: mealLogId, memberId }).exec();
		if (!meal) throw new BadRequestException('Meal log not found or access denied');

		await this.nutritionModel.findOneAndUpdate(
			{ memberId, nutritionDate: meal.mealDate },
			{
				$inc: {
					totalCalories: -meal.calories,
					totalProtein: -(meal.protein ?? 0),
					totalCarbs: -(meal.carbs ?? 0),
					totalFats: -(meal.fats ?? 0),
				},
			},
		);
		return meal;
	}

	public async getNutritionHistory(memberId: string): Promise<Nutrition[]> {
		return await this.nutritionModel.find({ memberId }).sort({ nutritionDate: -1 }).exec();
	}

	public getNutritionRecommendation(input: NutritionRecommendationInput): NutritionRecommendation {
		const { gender, age, heightCm, weightKg, activityLevel, goal } = input;

		const bmr =
			gender === Gender.MALE
				? 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age
				: 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;

		const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel];

		const dailyCalories =
			goal === FitnessGoal.WEIGHT_LOSS ? tdee - 500 : goal === FitnessGoal.MUSCLE_GAIN ? tdee + 400 : tdee;

		const proteinFactor = goal === FitnessGoal.MUSCLE_GAIN ? 2.2 : goal === FitnessGoal.MAINTENANCE ? 1.8 : 1.6;
		const dailyProtein = Math.round(weightKg * proteinFactor);
		const dailyFats = Math.round((dailyCalories * 0.25) / 9);
		const dailyCarbs = Math.max(0, Math.round((dailyCalories - dailyProtein * 4 - dailyFats * 9) / 4));

		const bmi = weightKg / (heightCm / 100) ** 2;
		const bmiCategory = bmi < 18.5 ? 'Kam vazn' : bmi < 25 ? 'Normal vazn' : bmi < 30 ? 'Ortiqcha vazn' : 'Semizlik';

		return {
			bmr: Math.round(bmr),
			tdee: Math.round(tdee),
			dailyCalories: Math.round(dailyCalories),
			dailyProtein,
			dailyCarbs,
			dailyFats,
			bmi: Math.round(bmi * 10) / 10,
			bmiCategory,
			goal,
			mealsPerDay: 4,
			mealPlan: this.buildMealPlan(dailyCalories, dailyProtein, dailyCarbs, dailyFats, goal),
			tips: this.buildTips(goal, bmi, activityLevel),
		};
	}

	private buildMealPlan(
		calories: number,
		protein: number,
		carbs: number,
		fats: number,
		goal: FitnessGoal,
	): MealSuggestion[] {
		const splits = [
			{ type: MealType.BREAKFAST, ratio: 0.25 },
			{ type: MealType.LUNCH, ratio: 0.35 },
			{ type: MealType.DINNER, ratio: 0.3 },
			{ type: MealType.SNACK, ratio: 0.1 },
		];

		const foodsByMeal: Record<MealType, string[]> = {
			[MealType.BREAKFAST]:
				goal === FitnessGoal.WEIGHT_LOSS
					? ['Tuxum omlet (2 ta)', "Yulaf bo'tqasi", "Qora non (1 bo'lak)", 'Yashil choy']
					: goal === FitnessGoal.MUSCLE_GAIN
						? ['Tuxum omlet (4 ta)', "Yulaf bo'tqasi sut bilan", 'Banan', 'Grech non', 'Protein shake']
						: ['Tuxum (3 ta)', "Yulaf bo'tqasi", 'Meva', 'Qora non'],
			[MealType.LUNCH]:
				goal === FitnessGoal.WEIGHT_LOSS
					? ["Tovuq ko'kragi (150g)", 'Qovurilmagan sabzavotlar', 'Jigarrang guruch (100g)', 'Salat']
					: goal === FitnessGoal.MUSCLE_GAIN
						? ["Tovuq ko'kragi (250g)", 'Guruch (200g)', 'Loviya', "Sabzavot sho'rva", 'Qora non']
						: ['Baliq yoki tovuq (200g)', 'Jigarrang guruch (150g)', 'Sabzavot salati', 'Qaynatilgan kartoshka'],
			[MealType.DINNER]:
				goal === FitnessGoal.WEIGHT_LOSS
					? ['Baliq (150g)', "Bug'langan sabzavotlar", 'Qaynatilgan kartoshka (100g)']
					: goal === FitnessGoal.MUSCLE_GAIN
						? ["Mol go'shti (200g)", 'Makaron (150g)', 'Sabzavot garnitur', 'Tvorog']
						: ['Tovuq yoki baliq (180g)', 'Sabzavotlar', 'Makaron yoki kartoshka (120g)'],
			[MealType.SNACK]:
				goal === FitnessGoal.WEIGHT_LOSS
					? ['Tvorog (150g)', 'Olma yoki nok', "Yong'oq (20g)"]
					: goal === FitnessGoal.MUSCLE_GAIN
						? ['Protein kokteyli', 'Banan', "Yong'oq (30g)", 'Tvorog (200g)']
						: ['Kefir (200ml)', 'Meva', "Yong'oq (25g)"],
		};

		return splits.map(({ type, ratio }) => ({
			mealType: type,
			suggestedFoods: foodsByMeal[type],
			targetCalories: Math.round(calories * ratio),
			targetProtein: Math.round(protein * ratio),
			targetCarbs: Math.round(carbs * ratio),
			targetFats: Math.round(fats * ratio),
		}));
	}

	private buildTips(goal: FitnessGoal, bmi: number, activityLevel: ActivityLevel): string[] {
		const tips = [
			'Kuniga kamida 2-2.5 litr suv iching.',
			'Har kuni 3-4 soatlik intervalda ovqatlaning.',
			'Taomlarni diqqat bilan chaynab yeng — bu ovqat hazm qilishni yaxshilaydi.',
		];

		if (goal === FitnessGoal.WEIGHT_LOSS) {
			tips.push('Shirinliklardan va gazli ichimliklardan saqlaning.');
			tips.push('Kechki ovqatni yotishdan 3 soat oldin tugatishga harakat qiling.');
			tips.push('Har kuni kamida 30 daqiqa kardio mashq qiling.');
		} else if (goal === FitnessGoal.MUSCLE_GAIN) {
			tips.push('Mashqdan keyin 30 daqiqa ichida protein qabul qiling.');
			tips.push("Uyqu juda muhim — kuniga 7-9 soat uxlang, chunki mushaklar uyquda o'sadi.");
			tips.push("Kreatin va whey protein qo'shimchasini ko'rib chiqing.");
		} else {
			tips.push("Makroelementlar balansini saqlang: protein, karbohidrat va yog'.");
			tips.push("Rangdor sabzavotlar va mevalarni ko'proq iste'mol qiling.");
		}

		if (bmi > 25) tips.push("BMI ko'rsatkichingizni kamaytirish uchun kardio mashqlarini oshiring.");
		else if (bmi < 18.5) tips.push("Vaznni oshirish uchun kaloriya defitsitiga yo'l qo'ymang.");

		if (activityLevel === ActivityLevel.SEDENTARY)
			tips.push("Ko'proq harakatlanishga harakat qiling — har soatda bir marta o'rndan turing.");

		return tips;
	}
}
