import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionModule } from '../subscription/subscription.module';
import { DashboardResolver } from './dashboard.resolver';
import { DashboardService } from './dashboard.service';
import { AuthModule } from '../auth/auth.module';
import WorkoutSchema from '../../schemas/Workout.model';
import ProgressSchema from '../../schemas/Progress.model';
import NutritionSchema from '../../schemas/Nutrition.model';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Workout', schema: WorkoutSchema },
			{ name: 'Progress', schema: ProgressSchema },
			{ name: 'Nutrition', schema: NutritionSchema },
		]),
		SubscriptionModule,
		AuthModule,
	],
	providers: [DashboardResolver, DashboardService],
	exports: [DashboardService],
})
export class DashboardModule {}
