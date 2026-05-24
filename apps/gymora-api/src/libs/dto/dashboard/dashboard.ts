import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DashboardStats {
	@Field(() => String)
	memberId: string;
	@Field(() => Float)
	totalCalories: number;
	@Field(() => Int)
	workoutCount: number;
	@Field(() => Int)
	progressEntries: number;
	@Field(() => String)
	subscriptionSummary: string;
}
