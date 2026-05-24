import { Schema } from 'mongoose';
import { PaymentStatus } from '../libs/enums/gymora.enum';

const PaymentSchema = new Schema(
	{
		memberId: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
		paymentAmount: { type: Number, required: true },
		paymentCurrency: { type: String, default: 'USD' },
		paymentStatus: { type: String, enum: PaymentStatus, default: PaymentStatus.PAID },
		transactionId: { type: String, required: true },
		paymentProvider: { type: String, default: 'MOCK' },
		paymentNote: { type: String },
	},
	{ timestamps: true, collection: 'payments' },
);

export default PaymentSchema;
