import { Field, Float, ObjectType } from '@nestjs/graphql';
import { type ObjectId } from 'mongoose';
import { MealType } from '../../enums/gymora.enum';

@ObjectType()
export class Nutrition {
	@Field(() => String)
	_id: ObjectId;
	@Field(() => String)
	memberId: ObjectId;
	@Field(() => Date)
	nutritionDate: Date;
	@Field(() => Float)
	totalCalories: number;
	@Field(() => Float)
	totalProtein: number;
	@Field(() => Float)
	totalCarbs: number;
	@Field(() => Float)
	totalFats: number;
	@Field(() => Date)
	createdAt: Date;
	@Field(() => Date)
	updatedAt: Date;
}

@ObjectType()
export class MealLog {
	@Field(() => String)
	_id: ObjectId;
	@Field(() => String)
	memberId: ObjectId;
	@Field(() => MealType)
	mealType: MealType;
	@Field(() => String)
	mealName: string;
	@Field(() => Float)
	calories: number;
	@Field(() => Float)
	protein: number;
	@Field(() => Float)
	carbs: number;
	@Field(() => Float)
	fats: number;
	@Field(() => Date)
	mealDate: Date;
	@Field(() => String, { nullable: true })
	mealImage?: string;
	@Field(() => Date)
	createdAt: Date;
	@Field(() => Date)
	updatedAt: Date;
}
