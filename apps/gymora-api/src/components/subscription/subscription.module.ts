import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import SubscriptionSchema from '../../schemas/Subscription.model';
import { SubscriptionResolver } from './subscription.resolver';
import { SubscriptionService } from './subscription.service';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Subscription', schema: SubscriptionSchema }]), AuthModule],
	providers: [SubscriptionResolver, SubscriptionService],
	exports: [SubscriptionService],
})
export class SubscriptionModule {}
