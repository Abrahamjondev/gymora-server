import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { FitnessGoal, MealType } from '../../enums/gymora.enum';

@ObjectType()
export class MealSuggestion {
	@Field(() => MealType)
	mealType: MealType;

	@Field(() => [String])
	suggestedFoods: string[];

	@Field(() => Float)
	targetCalories: number;

	@Field(() => Float)
	targetProtein: number;

	@Field(() => Float)
	targetCarbs: number;

	@Field(() => Float)
	targetFats: number;
}

@ObjectType()
export class NutritionRecommendation {
	@Field(() => Float)
	bmr: number;

	@Field(() => Float)
	tdee: number;

	@Field(() => Float)
	dailyCalories: number;

	@Field(() => Float)
	dailyProtein: number;

	@Field(() => Float)
	dailyCarbs: number;

	@Field(() => Float)
	dailyFats: number;

	@Field(() => Float)
	bmi: number;

	@Field(() => String)
	bmiCategory: string;

	@Field(() => FitnessGoal)
	goal: FitnessGoal;

	@Field(() => Int)
	mealsPerDay: number;

	@Field(() => [MealSuggestion])
	mealPlan: MealSuggestion[];

	@Field(() => [String])
	tips: string[];
}
