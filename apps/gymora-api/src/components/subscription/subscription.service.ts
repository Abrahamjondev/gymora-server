import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from '../../libs/dto/subscription/subscription';
import { SubscriptionInput } from '../../libs/dto/subscription/subscription.input';

@Injectable()
export class SubscriptionService {
	constructor(@InjectModel('Subscription') private readonly subscriptionModel: Model<Subscription>) {}

	public async createSubscription(input: SubscriptionInput): Promise<Subscription> {
		return await this.subscriptionModel.create(input);
	}

	public async getMemberSubscriptions(memberId: string): Promise<Subscription[]> {
		return await this.subscriptionModel.find({ memberId }).sort({ createdAt: -1 }).exec();
	}
}
