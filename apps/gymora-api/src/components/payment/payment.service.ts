import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Payment } from '../../libs/dto/payment/payment';
import { PaymentInitiateResult } from '../../libs/dto/payment/payment';
import { PaymentInput } from '../../libs/dto/payment/payment.input';
import { PaymentProvider, PaymentStatus, SubscriptionPlan } from '../../libs/enums/gymora.enum';

const PLAN_PRICES: Record<SubscriptionPlan, number> = {
	[SubscriptionPlan.MONTHLY]: 14.99,
	[SubscriptionPlan.YEARLY]: 119.88,
};

@Injectable()
export class PaymentService {
	constructor(
		@InjectModel('Payment') private readonly paymentModel: Model<Payment>,
		private readonly configService: ConfigService,
	) {}

	public async initiatePayment(input: PaymentInput): Promise<PaymentInitiateResult> {
		const expectedAmount = PLAN_PRICES[input.subscriptionPlan];
		if (expectedAmount !== undefined && Math.abs(input.paymentAmount - expectedAmount) > 0.01) {
			throw new BadRequestException(
				`Invalid payment amount. Expected $${expectedAmount} for ${input.subscriptionPlan} plan.`,
			);
		}
		const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
		const hasStripe = !!stripeKey && !stripeKey.includes('your_');

		if (input.paymentProvider === PaymentProvider.STRIPE && hasStripe) {
			return this.initiateStripe(input, stripeKey);
		}

		if (process.env.NODE_ENV === 'production') {
			throw new BadRequestException('Payment provider is not configured.');
		}

		// Mock: to'lovni darhol PAID qilamiz
		const payment = await this.paymentModel.create({
			memberId: input.memberId,
			paymentAmount: input.paymentAmount,
			paymentCurrency: input.paymentCurrency ?? 'USD',
			subscriptionPlan: input.subscriptionPlan,
			paymentStatus: PaymentStatus.PAID,
			transactionId: `mock_${uuidv4()}`,
			paymentProvider: input.paymentProvider,
			paymentNote: input.paymentNote,
		});

		return {
			paymentId: payment._id.toString(),
			provider: input.paymentProvider ?? PaymentProvider.STRIPE,
			clientSecret: 'mock_paid',
		};
	}

	private async initiateStripe(input: PaymentInput, stripeKey: string): Promise<PaymentInitiateResult> {
		const Stripe = (await import('stripe')).default;
		const stripe = new Stripe(stripeKey);

		const amountInCents = Math.round(input.paymentAmount * 100);
		const intent = await stripe.paymentIntents.create({
			amount: amountInCents,
			currency: (input.paymentCurrency ?? 'USD').toLowerCase(),
			metadata: { memberId: input.memberId ?? '', subscriptionPlan: input.subscriptionPlan },
		});

		const payment = await this.paymentModel.create({
			memberId: input.memberId,
			paymentAmount: input.paymentAmount,
			paymentCurrency: input.paymentCurrency ?? 'USD',
			subscriptionPlan: input.subscriptionPlan,
			paymentStatus: PaymentStatus.PENDING,
			transactionId: intent.id,
			paymentProvider: 'STRIPE',
			paymentNote: input.paymentNote,
		});

		return {
			paymentId: payment._id.toString(),
			provider: PaymentProvider.STRIPE,
			clientSecret: intent.client_secret ?? undefined,
		};
	}

	public async getPaymentHistory(memberId: string): Promise<Payment[]> {
		return await this.paymentModel.find({ memberId }).sort({ createdAt: -1 }).exec();
	}
}
