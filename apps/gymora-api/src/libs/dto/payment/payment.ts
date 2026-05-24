import { Field, Float, ObjectType } from '@nestjs/graphql';
import { type ObjectId } from 'mongoose';
import { PaymentStatus } from '../../enums/gymora.enum';

@ObjectType()
export class Payment {
	@Field(() => String)
	_id: ObjectId;
	@Field(() => String)
	memberId: ObjectId;
	@Field(() => Float)
	paymentAmount: number;
	@Field(() => String)
	paymentCurrency: string;
	@Field(() => PaymentStatus)
	paymentStatus: PaymentStatus;
	@Field(() => String)
	transactionId: string;
	@Field(() => String)
	paymentProvider: string;
	@Field(() => String, { nullable: true })
	paymentNote?: string;
}
