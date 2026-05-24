import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { NotificationType } from '../../enums/gymora.enum';

@InputType()
export class NotificationInput {
	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: string;
	@IsOptional()
	@Field(() => NotificationType, { nullable: true })
	notificationType?: NotificationType;
	@IsNotEmpty()
	@Field(() => String)
	notificationTitle: string;
	@IsNotEmpty()
	@Field(() => String)
	notificationMessage: string;
}
