import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import CourseSchema from '../../schemas/Course.model';
import MemberSchema from '../../schemas/Member.model';
import TrainerSchema from '../../schemas/Trainer.model';
import { CourseResolver } from './course.resolver';
import { CourseService } from './course.service';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Course', schema: CourseSchema },
			{ name: 'Member', schema: MemberSchema },
			{ name: 'Trainer', schema: TrainerSchema },
		]),
		AuthModule,
	],
	providers: [CourseResolver, CourseService],
	exports: [CourseService],
})
export class CourseModule {}
