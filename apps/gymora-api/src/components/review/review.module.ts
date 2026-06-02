import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import ReviewSchema from '../../schemas/Review.model';
import TrainerSchema from '../../schemas/Trainer.model';
import CourseSchema from '../../schemas/Course.model';
import WorkoutSchema from '../../schemas/Workout.model';
import { ReviewResolver } from './review.resolver';
import { ReviewService } from './review.service';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Review', schema: ReviewSchema },
			{ name: 'Trainer', schema: TrainerSchema },
			{ name: 'Course', schema: CourseSchema },
			{ name: 'Workout', schema: WorkoutSchema },
		]),
		AuthModule,
	],
	providers: [ReviewResolver, ReviewService],
	exports: [ReviewService],
})
export class ReviewModule {}
