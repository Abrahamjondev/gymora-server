import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AnalyticsResult {
	@Field(() => Float)
	bmi: number;
	@Field(() => Float)
	bmr: number;
	@Field(() => Float)
	dailyCalories: number;
	@Field(() => String)
	summary: string;
}
