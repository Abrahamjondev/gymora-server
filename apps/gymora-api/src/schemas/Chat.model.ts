import { Schema } from 'mongoose';

const ChatSchema = new Schema(
	{
		senderId: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
		receiverId: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
		message: { type: String, required: true },
		isRead: { type: Boolean, default: false },
	},
	{ timestamps: true, collection: 'chats' },
);

export default ChatSchema;
