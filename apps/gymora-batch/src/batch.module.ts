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
		]),
	],
	controllers: [BatchController],
	providers: [BatchService, AnalyticsJob, SubscriptionJob, ReminderJob, NutritionJob],
})
export class BatchModule {}
