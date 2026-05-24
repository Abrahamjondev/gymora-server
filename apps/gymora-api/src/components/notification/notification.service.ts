import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GymoraNotification } from '../../libs/dto/notification/notification';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class NotificationService {
	constructor(@InjectModel('Notification') private readonly notificationModel: Model<GymoraNotification>) {}

	public async createNotification(input: NotificationInput): Promise<GymoraNotification> {
		return await this.notificationModel.create(input);
	}

	public async getNotifications(memberId: string): Promise<GymoraNotification[]> {
		return await this.notificationModel.find({ memberId }).sort({ createdAt: -1 }).exec();
	}

	public async markNotificationRead(notificationId: string, memberId: string): Promise<GymoraNotification> {
		const result = await this.notificationModel
			.findOneAndUpdate({ _id: notificationId, memberId }, { isRead: true }, { new: true })
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}
}
