import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Nutrition } from '../../gymora-api/src/libs/dto/nutrition/nutrition';
import { GymoraNotification } from '../../gymora-api/src/libs/dto/notification/notification';
import { Subscription } from '../../gymora-api/src/libs/dto/subscription/subscription';
import { NotificationType, SubscriptionStatus } from '../../gymora-api/src/libs/enums/gymora.enum';

@Injectable()
export class BatchService {
	constructor(
		@InjectModel('Nutrition')
		private readonly nutritionModel: Model<Nutrition>,
		@InjectModel('Notification')
		private readonly notificationModel: Model<GymoraNotification>,
		@InjectModel('Subscription')
		private readonly subscriptionModel: Model<Subscription>,
	) {}

	public async refreshAnalytics(): Promise<void> {
		console.log('batchAnalytics');
	}

	public async expireSubscriptions(): Promise<void> {
		console.log('batchSubscriptions');
		await this.subscriptionModel
			.updateMany({ expiresAt: { $lt: new Date() }, subscriptionStatus: SubscriptionStatus.ACTIVE }, { subscriptionStatus: SubscriptionStatus.EXPIRED })
			.exec();
	}

	public async createDailyReminders(): Promise<void> {
		console.log('batchReminders');
		const activeSubscriptions = await this.subscriptionModel.find({ subscriptionStatus: SubscriptionStatus.ACTIVE }).exec();
		const notifications = activeSubscriptions.map((subscription) => ({
			memberId: subscription.memberId,
			notificationType: NotificationType.WORKOUT,
			notificationTitle: 'Gymora daily workout',
			notificationMessage: 'Your daily workout and nutrition plan is ready.',
		}));
		if (notifications.length) await this.notificationModel.insertMany(notifications);
	}

	public async summarizeNutrition(): Promise<void> {
		console.log('batchNutrition');
		await this.nutritionModel.find().limit(1).exec();
	}

	public getHello(): string {
		return 'Welcome to Gymora BATCH server!';
	}
}
