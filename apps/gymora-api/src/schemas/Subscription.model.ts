import { Schema } from 'mongoose';
import { SubscriptionPlan, SubscriptionStatus } from '../libs/enums/gymora.enum';

const SubscriptionSchema = new Schema(
	{
		memberId: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
		paymentId: { type: Schema.Types.ObjectId, required: true, ref: 'Payment', unique: true },
		subscriptionPlan: { type: String, enum: SubscriptionPlan, required: true },
		subscriptionStatus: { type: String, enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE },
		startedAt: { type: Date, required: true },
		expiresAt: { type: Date, required: true },
		price: { type: Number, required: true },
	},
	{ timestamps: true, collection: 'subscriptions' },
);

SubscriptionSchema.index({ memberId: 1, subscriptionStatus: 1, expiresAt: 1 });
SubscriptionSchema.index({ memberId: 1, createdAt: -1 });

export default SubscriptionSchema;
