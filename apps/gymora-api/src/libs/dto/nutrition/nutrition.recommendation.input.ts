import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, Max, Min } from 'class-validator';
import { ActivityLevel, FitnessGoal, Gender } from '../../enums/gymora.enum';

@InputType()
export class NutritionRecommendationInput {
	@IsNotEmpty()
	@IsEnum(Gender)
	@Field(() => Gender)
	gender: Gender;

	@IsNotEmpty()
	@Min(1)
	@Max(100)
	@Field(() => Int)
	age: number;

	@IsNotEmpty()
	@Min(50)
	@Max(250)
	@Field(() => Float)
	heightCm: number;

	@IsNotEmpty()
	@Min(20)
	@Max(300)
	@Field(() => Float)
	weightKg: number;

	@IsNotEmpty()
	@IsEnum(ActivityLevel)
	@Field(() => ActivityLevel)
	activityLevel: ActivityLevel;

	@IsNotEmpty()
	@IsEnum(FitnessGoal)
	@Field(() => FitnessGoal)
	goal: FitnessGoal;
}
