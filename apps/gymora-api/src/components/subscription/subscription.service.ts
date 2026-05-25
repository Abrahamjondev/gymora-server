import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from '../../libs/dto/subscription/subscription';
import { SubscriptionInput } from '../../libs/dto/subscription/subscription.input';
import { SubscriptionPlan } from '../../libs/enums/gymora.enum';

@Injectable()
export class SubscriptionService {
	constructor(@InjectModel('Subscription') private readonly subscriptionModel: Model<Subscription>) {}

	public async createSubscription(input: SubscriptionInput): Promise<Subscription> {
		const startedAt = new Date();
		const expiresAt = new Date(startedAt);

		if (input.subscriptionPlan === SubscriptionPlan.MONTHLY) {
			expiresAt.setDate(expiresAt.getDate() + 30);
		} else {
			expiresAt.setDate(expiresAt.getDate() + 365);
		}

		return await this.subscriptionModel.create({ ...input, startedAt, expiresAt });
	}

	public async getMemberSubscriptions(memberId: string): Promise<Subscription[]> {
		return await this.subscriptionModel.find({ memberId }).sort({ createdAt: -1 }).exec();
	}
}
