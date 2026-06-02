import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DashboardStats } from '../../libs/dto/dashboard/dashboard';
import { SubscriptionService } from '../subscription/subscription.service';
import { SubscriptionStatus } from '../../libs/enums/gymora.enum';

@Injectable()
export class DashboardService {
	constructor(
		@InjectModel('Workout') private readonly workoutModel: Model<any>,
		@InjectModel('Progress') private readonly progressModel: Model<any>,
		@InjectModel('Nutrition') private readonly nutritionModel: Model<any>,
		private readonly subscriptionService: SubscriptionService,
	) {}

	public async getDashboardStats(memberId: string): Promise<DashboardStats> {
		const [caloriesResult, workoutCount, progressEntries, subscriptions] = await Promise.all([
			this.nutritionModel.aggregate([
				{ $match: { memberId } },
				{ $group: { _id: null, total: { $sum: '$totalCalories' } } },
			]),
			this.workoutModel.countDocuments({ memberId, deletedAt: { $exists: false } }),
			this.progressModel.countDocuments({ memberId }),
			this.subscriptionService.getMemberSubscriptions(memberId),
		]);

		const totalCalories = caloriesResult[0]?.total ?? 0;

		// Faqat haqiqiy aktiv va muddati o'tmagan obunani ko'rsatamiz
		const now = new Date();
		const activeSubscription =
			subscriptions.find(
				(s) => s.subscriptionStatus === SubscriptionStatus.ACTIVE && new Date(s.expiresAt) > now,
			) ?? null;

		return {
			memberId,
			totalCalories,
			workoutCount,
			progressEntries,
			subscriptionSummary: activeSubscription
				? `${activeSubscription.subscriptionPlan}:${activeSubscription.subscriptionStatus}`
				: 'NO_SUBSCRIPTION',
		};
	}
}
