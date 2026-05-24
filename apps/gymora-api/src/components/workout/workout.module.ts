import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import WorkoutSchema from '../../schemas/Workout.model';
import MemberSchema from '../../schemas/Member.model';
import { WorkoutResolver } from './workout.resolver';
import { WorkoutService } from './workout.service';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Workout', schema: WorkoutSchema },
			{ name: 'Member', schema: MemberSchema },
		]),
		AuthModule,
	],
	providers: [WorkoutResolver, WorkoutService],
	exports: [WorkoutService],
})
export class WorkoutModule {}
