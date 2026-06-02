import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import WorkoutSchema from '../../schemas/Workout.model';
import MemberSchema from '../../schemas/Member.model';
import { WorkoutResolver } from './workout.resolver';
import { WorkoutService } from './workout.service';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import { LikeModule } from '../like/like.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Workout', schema: WorkoutSchema },
			{ name: 'Member', schema: MemberSchema },
		]),
		AuthModule,
		ViewModule,
		LikeModule,
		ConfigModule,
	],
	providers: [WorkoutResolver, WorkoutService],
	exports: [WorkoutService],
})
export class WorkoutModule {}
