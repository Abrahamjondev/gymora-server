import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Payment } from '../../libs/dto/payment/payment';
import { PaymentInput } from '../../libs/dto/payment/payment.input';
import { PaymentService } from './payment.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';

@Resolver()
export class PaymentResolver {
	constructor(private readonly paymentService: PaymentService) {}

	@UseGuards(AuthGuard)
	@Mutation(() => Payment)
	public async createPayment(@Args('input') input: PaymentInput, @AuthMember('_id') memberId: ObjectId): Promise<Payment> {
		return await this.paymentService.createPayment({ ...input, memberId: memberId.toString() });
	}

	@UseGuards(AuthGuard)
	@Query(() => [Payment])
	public async getPaymentHistory(@AuthMember('_id') memberId: ObjectId): Promise<Payment[]> {
		return await this.paymentService.getPaymentHistory(memberId.toString());
	}
}
