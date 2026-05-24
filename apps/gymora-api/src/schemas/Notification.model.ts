import { Schema } from 'mongoose';
import { NotificationType } from '../libs/enums/gymora.enum';

const NotificationSchema = new Schema(
	{
		memberId: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
		notificationType: { type: String, enum: NotificationType, default: NotificationType.SYSTEM },
		notificationTitle: { type: String, required: true },
		notificationMessage: { type: String, required: true },
		isRead: { type: Boolean, default: false },
	},
	{ timestamps: true, collection: 'notifications' },
);

export default NotificationSchema;
