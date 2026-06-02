import { Field, ObjectType } from '@nestjs/graphql';
import { type ObjectId } from 'mongoose';
import { NotificationType } from '../../enums/gymora.enum';

@ObjectType()
export class GymoraNotification {
	@Field(() => String)
	_id: ObjectId;
	@Field(() => String)
	memberId: ObjectId;
	@Field(() => NotificationType)
	notificationType: NotificationType;
	@Field(() => String)
	notificationTitle: string;
	@Field(() => String)
	notificationMessage: string;
	@Field(() => Boolean)
	isRead: boolean;
	@Field(() => Date)
	createdAt: Date;
	@Field(() => Date)
	updatedAt: Date;
}
