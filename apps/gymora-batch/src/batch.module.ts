import { Module } from '@nestjs/common';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import NutritionSchema from '../../gymora-api/src/schemas/Nutrition.model';
import NotificationSchema from '../../gymora-api/src/schemas/Notification.model';
import SubscriptionSchema from '../../gymora-api/src/schemas/Subscription.model';
import TrainerSchema from '../../gymora-api/src/schemas/Trainer.model';
import MemberSchema from '../../gymora-api/src/schemas/Member.model';
import CourseSchema from '../../gymora-api/src/schemas/Course.model';
import WorkoutSchema from '../../gymora-api/src/schemas/Workout.model';
import { AnalyticsJob } from './jobs/analytics.job';
import { NutritionJob } from './jobs/nutrition.job';
import { ReminderJob } from './jobs/reminder.job';
import { SubscriptionJob } from './jobs/subscription.job';

@Module({
	imports: [
		ConfigModule.forRoot(),
		DatabaseModule,
		ScheduleModule.forRoot(),
		MongooseModule.forFeature([
			{ name: 'Nutrition', schema: NutritionSchema },
			{ name: 'Notification', schema: NotificationSchema },
			{ name: 'Subscription', schema: SubscriptionSchema },
			{ name: 'Trainer', schema: TrainerSchema },
			{ name: 'Member', schema: MemberSchema },
			{ name: 'Course', schema: CourseSchema },
			{ name: 'Workout', schema: WorkoutSchema },
		]),
	],
	controllers: [BatchController],
	providers: [BatchService, AnalyticsJob, SubscriptionJob, ReminderJob, NutritionJob],
})
export class BatchModule {}
