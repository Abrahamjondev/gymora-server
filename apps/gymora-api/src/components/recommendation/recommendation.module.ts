import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecommendationResolver } from './recommendation.resolver';
import { RecommendationService } from './recommendation.service';
import { AuthModule } from '../auth/auth.module';
import WorkoutSchema from '../../schemas/Workout.model';
import TrainerSchema from '../../schemas/Trainer.model';
import CourseSchema from '../../schemas/Course.model';
import MemberSchema from '../../schemas/Member.model';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Workout', schema: WorkoutSchema },
			{ name: 'Trainer', schema: TrainerSchema },
			{ name: 'Course', schema: CourseSchema },
			{ name: 'Member', schema: MemberSchema },
		]),
		AuthModule,
	],
	providers: [RecommendationResolver, RecommendationService],
	exports: [RecommendationService],
})
export class RecommendationModule {}
