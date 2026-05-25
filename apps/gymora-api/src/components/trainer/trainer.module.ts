import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import TrainerSchema from '../../schemas/Trainer.model';
import MemberSchema from '../../schemas/Member.model';
import { TrainerResolver } from './trainer.resolver';
import { TrainerService } from './trainer.service';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import { LikeModule } from '../like/like.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Trainer', schema: TrainerSchema },
			{ name: 'Member', schema: MemberSchema },
		]),
		AuthModule,
		ViewModule,
		LikeModule,
	],
	providers: [TrainerResolver, TrainerService],
	exports: [TrainerService],
})
export class TrainerModule {}
