import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Nutrition } from '../../gymora-api/src/libs/dto/nutrition/nutrition';
import { GymoraNotification } from '../../gymora-api/src/libs/dto/notification/notification';
import { Subscription } from '../../gymora-api/src/libs/dto/subscription/subscription';
import { NotificationType, SubscriptionStatus } from '../../gymora-api/src/libs/enums/gymora.enum';

@Injectable()
export class BatchService {
	private readonly logger = new Logger('BatchService');

	constructor(
		@InjectModel('Nutrition') private readonly nutritionModel: Model<Nutrition>,
		@InjectModel('Notification') private readonly notificationModel: Model<GymoraNotification>,
		@InjectModel('Subscription') private readonly subscriptionModel: Model<Subscription>,
		@InjectModel('Trainer') private readonly trainerModel: Model<any>,
		@InjectModel('Member') private readonly memberModel: Model<any>,
		@InjectModel('Course') private readonly courseModel: Model<any>,
		@InjectModel('Workout') private readonly workoutModel: Model<any>,
	) {}

	/**
	 * Har hafta dushanba 01:00 da ishga tushadi
	 * Barcha ranklar 0 ga reset → qayta hisoblash
	 * Formula (nestar pattern'dan):
	 *   Trainer rank = rating*5 + courseSales*4 + followers*2 + likes*1
	 *   Course rank  = rating*5 + purchases*4  + likes*2    + views*1
	 *   Workout rank = rating*5 + likes*3      + views*1
	 */
	public async refreshAnalytics(): Promise<void> {
		this.logger.log('=== refreshAnalytics started ===');

		await this.batchRollback();
		await this.batchTopTrainers();
		await this.batchHotWorkouts();
		await this.batchFeaturedCourses();

		this.logger.log('=== refreshAnalytics done ===');
	}

	/** 1. Barcha ranklar 0 ga reset */
	private async batchRollback(): Promise<void> {
		await Promise.all([
			this.trainerModel.updateMany({}, { trainerRank: 0 }),
			this.courseModel.updateMany({}, { courseRank: 0 }),
			this.workoutModel.updateMany({}, { workoutRank: 0 }),
		]);
		this.logger.log('Rollback done — all ranks set to 0');
	}

	/** 2. Top trainers — haftalik */
	private async batchTopTrainers(): Promise<void> {
		const trainers = await this.trainerModel.find({}).lean().exec();
		if (!trainers.length) { this.logger.log('batchTopTrainers: no trainers'); return; }

		const updates = trainers.map(async (trainer: any) => {
			const member = await this.memberModel.findById(trainer.memberId).lean().exec();

			const coursesArr = await this.courseModel.find({ trainerId: trainer._id }).lean().exec();
			const totalSales = coursesArr.reduce((sum: number, c: any) => sum + (c.purchasedMembers?.length ?? 0), 0);

			const rating = trainer.trainerRating ?? 0;
			const followers = (member as any)?.memberFollowers ?? 0;
			const likes = (member as any)?.memberLikes ?? 0;

			const rank = rating * 5 + totalSales * 4 + followers * 2 + likes * 1;
			return this.trainerModel.findByIdAndUpdate(trainer._id, { trainerRank: rank });
		});

		await Promise.all(updates);
		this.logger.log(`batchTopTrainers: ${trainers.length} trainers ranked`);
	}

	/** 3. Hot workouts — haftalik */
	private async batchHotWorkouts(): Promise<void> {
		const workouts = await this.workoutModel.find({ isFree: true }).lean().exec();
		if (!workouts.length) { this.logger.log('batchHotWorkouts: no free workouts'); return; }

		const updates = workouts.map(async (workout: any) => {
			const rating = workout.workoutRating ?? 0;
			const likes = workout.workoutLikes ?? 0;
			const views = workout.workoutViews ?? 0;

			const rank = rating * 5 + likes * 3 + views * 1;
			return this.workoutModel.findByIdAndUpdate(workout._id, { workoutRank: rank });
		});

		await Promise.all(updates);
		this.logger.log(`batchHotWorkouts: ${workouts.length} workouts ranked`);
	}

	/** 4. Featured courses — haftalik */
	private async batchFeaturedCourses(): Promise<void> {
		const courses = await this.courseModel.find({}).lean().exec();
		if (!courses.length) { this.logger.log('batchFeaturedCourses: no courses'); return; }

		const updates = courses.map(async (course: any) => {
			const rating = course.courseRating ?? 0;
			const purchases = course.purchasedMembers?.length ?? 0;
			const likes = course.courseLikes ?? 0;
			const views = course.courseViews ?? 0;

			const rank = rating * 5 + purchases * 4 + likes * 2 + views * 1;
			return this.courseModel.findByIdAndUpdate(course._id, { courseRank: rank });
		});

		await Promise.all(updates);
		this.logger.log(`batchFeaturedCourses: ${courses.length} courses ranked`);
	}

	/** Subscription expiry */
	public async expireSubscriptions(): Promise<void> {
		await this.subscriptionModel
			.updateMany(
				{ expiresAt: { $lt: new Date() }, subscriptionStatus: SubscriptionStatus.ACTIVE },
				{ subscriptionStatus: SubscriptionStatus.EXPIRED },
			)
			.exec();
	}

	/** Daily reminders */
	public async createDailyReminders(): Promise<void> {
		const activeSubscriptions = await this.subscriptionModel.find({ subscriptionStatus: SubscriptionStatus.ACTIVE }).exec();
		const notifications = activeSubscriptions.map((s: any) => ({
			memberId: s.memberId,
			notificationType: NotificationType.WORKOUT,
			notificationTitle: 'Gymora daily workout',
			notificationMessage: 'Your daily workout and nutrition plan is ready.',
		}));
		if (notifications.length) await this.notificationModel.insertMany(notifications);
	}

	/** Nutrition summary */
	public async summarizeNutrition(): Promise<void> {
		// TODO: ertaga implement qilish
	}

	public getHello(): string {
		return 'Welcome to Gymora BATCH server!';
	}
}
