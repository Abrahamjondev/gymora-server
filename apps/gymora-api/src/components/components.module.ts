import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { ViewModule } from './view/view.module';
import { FollowModule } from './follow/follow.module';
import { TrainerModule } from './trainer/trainer.module';
import { CourseModule } from './course/course.module';
import { WorkoutModule } from './workout/workout.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AiModule } from './ai/ai.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { ProgressModule } from './progress/progress.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { ReviewModule } from './review/review.module';
import { NotificationModule } from './notification/notification.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PaymentModule } from './payment/payment.module';
import { ChatModule } from './chat/chat.module';
import { LessonModule } from './lesson/lesson.module';
import { BoardArticleModule } from './board-article/board-article.module';

@Module({
	imports: [
		MemberModule,
		AuthModule,
		CommentModule,
		LikeModule,
		ViewModule,
		FollowModule,
		TrainerModule,
		CourseModule,
		WorkoutModule,
		NutritionModule,
		AnalyticsModule,
		AiModule,
		SubscriptionModule,
		ProgressModule,
		RecommendationModule,
		ReviewModule,
		NotificationModule,
		DashboardModule,
		PaymentModule,
		ChatModule,
		LessonModule,
		BoardArticleModule,
	],
})
export class ComponentsModule {}
