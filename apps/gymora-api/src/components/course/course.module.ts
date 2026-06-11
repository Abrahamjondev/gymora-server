import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import CourseSchema from '../../schemas/Course.model';
import MemberSchema from '../../schemas/Member.model';
import TrainerSchema from '../../schemas/Trainer.model';
import LessonSchema from '../../schemas/Lesson.model';
import LessonProgressSchema from '../../schemas/LessonProgress.model';
import { CourseResolver } from './course.resolver';
import { CourseService } from './course.service';
import { AuthModule } from '../auth/auth.module';
import { LikeModule } from '../like/like.module';

@Module({
	imports: [
		ConfigModule,
		MongooseModule.forFeature([
			{ name: 'Course', schema: CourseSchema },
			{ name: 'Member', schema: MemberSchema },
			{ name: 'Trainer', schema: TrainerSchema },
			{ name: 'Lesson', schema: LessonSchema },
			{ name: 'LessonProgress', schema: LessonProgressSchema },
		]),
		AuthModule,
		LikeModule,
	],
	providers: [CourseResolver, CourseService],
	exports: [CourseService],
})
export class CourseModule {}
