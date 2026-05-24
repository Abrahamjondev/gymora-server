import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Payment } from '../../libs/dto/payment/payment';
import { PaymentInput } from '../../libs/dto/payment/payment.input';
import { PaymentStatus } from '../../libs/enums/gymora.enum';

@Injectable()
export class PaymentService {
	constructor(@InjectModel('Payment') private readonly paymentModel: Model<Payment>) {}

	public async createPayment(input: PaymentInput): Promise<Payment> {
		return await this.paymentModel.create({
			...input,
			paymentCurrency: input.paymentCurrency ?? 'USD',
			paymentStatus: PaymentStatus.PAID,
			transactionId: uuidv4(),
			paymentProvider: 'MOCK',
		});
	}

	public async getPaymentHistory(memberId: string): Promise<Payment[]> {
		return await this.paymentModel.find({ memberId }).sort({ createdAt: -1 }).exec();
	}
}
