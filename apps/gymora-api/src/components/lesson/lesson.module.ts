import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import LessonSchema from '../../schemas/Lesson.model';
import LessonProgressSchema from '../../schemas/LessonProgress.model';
import TrainerSchema from '../../schemas/Trainer.model';
import CourseSchema from '../../schemas/Course.model';
import { LessonResolver } from './lesson.resolver';
import { LessonService } from './lesson.service';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Lesson', schema: LessonSchema },
			{ name: 'LessonProgress', schema: LessonProgressSchema },
			{ name: 'Trainer', schema: TrainerSchema },
			{ name: 'Course', schema: CourseSchema },
		]),
		AuthModule,
	],
	providers: [LessonResolver, LessonService],
	exports: [LessonService],
})
export class LessonModule {}
