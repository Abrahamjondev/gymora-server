import { Module } from '@nestjs/common';
import { NutritionModule } from '../nutrition/nutrition.module';
import { ProgressModule } from '../progress/progress.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { WorkoutModule } from '../workout/workout.module';
import { DashboardResolver } from './dashboard.resolver';
import { DashboardService } from './dashboard.service';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [NutritionModule, WorkoutModule, ProgressModule, SubscriptionModule, AuthModule],
	providers: [DashboardResolver, DashboardService],
	exports: [DashboardService],
})
export class DashboardModule {}
