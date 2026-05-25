import { Injectable } from '@nestjs/common';
import { DashboardStats } from '../../libs/dto/dashboard/dashboard';
import { NutritionService } from '../nutrition/nutrition.service';
import { ProgressService } from '../progress/progress.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { WorkoutService } from '../workout/workout.service';

@Injectable()
export class DashboardService {
	constructor(
		private readonly nutritionService: NutritionService,
		private readonly workoutService: WorkoutService,
		private readonly progressService: ProgressService,
		private readonly subscriptionService: SubscriptionService,
	) {}

	public async getDashboardStats(memberId: string): Promise<DashboardStats> {
		const [nutrition, workouts, progresses, subscriptions] = await Promise.all([
			this.nutritionService.getNutritionHistory(memberId),
			this.workoutService.getMemberWorkouts(memberId),
			this.progressService.getProgressTimeline(memberId),
			this.subscriptionService.getMemberSubscriptions(memberId),
		]);
		const totalCalories = nutrition.reduce((sum, item) => sum + (item.totalCalories ?? 0), 0);
		const activeSubscription = subscriptions.find((s) => s.subscriptionStatus === 'ACTIVE') ?? subscriptions[0];
		return {
			memberId,
			totalCalories,
			workoutCount: workouts.length,
			progressEntries: progresses.length,
			subscriptionSummary: activeSubscription
				? `${activeSubscription.subscriptionPlan}:${activeSubscription.subscriptionStatus}`
				: 'NO_SUBSCRIPTION',
		};
	}
}
