import { Schema } from 'mongoose';
import { PaymentProvider, PaymentStatus, SubscriptionPlan } from '../libs/enums/gymora.enum';

const PaymentSchema = new Schema(
	{
		memberId: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
		paymentAmount: { type: Number, required: true },
		paymentCurrency: { type: String, default: 'USD' },
		paymentStatus: { type: String, enum: PaymentStatus, default: PaymentStatus.PENDING },
		subscriptionPlan: { type: String, enum: SubscriptionPlan },
		transactionId: { type: String },
		paymentProvider: { type: String, enum: PaymentProvider, required: true },
		paymentNote: { type: String },
	},
	{ timestamps: true, collection: 'payments' },
);

PaymentSchema.index({ memberId: 1, createdAt: -1 });
PaymentSchema.index({ paymentStatus: 1 });

export default PaymentSchema;
