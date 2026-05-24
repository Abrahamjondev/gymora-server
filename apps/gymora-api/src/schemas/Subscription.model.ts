import { Schema } from 'mongoose';
import { SubscriptionPlan, SubscriptionStatus } from '../libs/enums/gymora.enum';

const SubscriptionSchema = new Schema(
	{
		memberId: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
		subscriptionPlan: { type: String, enum: SubscriptionPlan, required: true },
		subscriptionStatus: { type: String, enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE },
		startedAt: { type: Date, required: true },
		expiresAt: { type: Date, required: true },
		price: { type: Number, required: true },
	},
	{ timestamps: true, collection: 'subscriptions' },
);

export default SubscriptionSchema;
