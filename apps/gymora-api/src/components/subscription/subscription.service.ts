import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from '../../libs/dto/subscription/subscription';
import { SubscriptionInput } from '../../libs/dto/subscription/subscription.input';
import { Payment } from '../../libs/dto/payment/payment';
import { PaymentProvider, PaymentStatus, SubscriptionPlan } from '../../libs/enums/gymora.enum';

@Injectable()
export class SubscriptionService {
	constructor(
		@InjectModel('Subscription') private readonly subscriptionModel: Model<Subscription>,
		@InjectModel('Payment') private readonly paymentModel: Model<Payment>,
	) {}

	public async createSubscription(input: SubscriptionInput): Promise<Subscription> {
		const payment = await this.paymentModel.findOne({
			_id: input.paymentId,
			memberId: input.memberId,
			subscriptionPlan: input.subscriptionPlan,
		}).exec();

		if (!payment) throw new BadRequestException('Payment record was not found for this subscription.');

		if (payment.paymentStatus !== PaymentStatus.PAID) {
			const verified = await this.verifyExternalPayment(payment);
			if (!verified) throw new BadRequestException('Payment is not completed yet.');
		}

		const existing = await this.subscriptionModel.findOne({ paymentId: input.paymentId }).exec();
		if (existing) return existing;

		// Haqiqiy aktiv obuna bo'lsa qayta yaratmaslik
		const activeExists = await this.subscriptionModel
			.findOne({ memberId: input.memberId, subscriptionStatus: 'ACTIVE', expiresAt: { $gt: new Date() } })
			.exec();
		if (activeExists) return activeExists;

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

	private async verifyExternalPayment(payment: Payment): Promise<boolean> {
		if (payment.paymentProvider !== PaymentProvider.STRIPE || !payment.transactionId) return false;

		const stripeKey = process.env.STRIPE_SECRET_KEY;
		if (!stripeKey) return false;

		const Stripe = (await import('stripe')).default;
		const stripe = new Stripe(stripeKey);
		const intent = await stripe.paymentIntents.retrieve(payment.transactionId);
		if (intent.status !== 'succeeded') return false;

		await this.paymentModel.findByIdAndUpdate(payment._id, { paymentStatus: PaymentStatus.PAID }).exec();
		return true;
	}
}
