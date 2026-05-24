import { Field, Float, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';
import { MealType } from '../../enums/gymora.enum';

@InputType()
export class MealLogInput {
	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: string;
	@IsNotEmpty()
	@Field(() => MealType)
	mealType: MealType;
	@IsNotEmpty()
	@Field(() => String)
	mealName: string;
	@IsNotEmpty()
	@Min(0)
	@Field(() => Float)
	calories: number;
	@IsOptional()
	@Field(() => Float, { nullable: true })
	protein?: number;
	@IsOptional()
	@Field(() => Float, { nullable: true })
	carbs?: number;
	@IsOptional()
	@Field(() => Float, { nullable: true })
	fats?: number;
	@IsNotEmpty()
	@Field(() => Date)
	mealDate: Date;
	@IsOptional()
	@Field(() => String, { nullable: true })
	mealImage?: string;
}
