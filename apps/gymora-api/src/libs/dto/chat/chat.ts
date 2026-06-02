import { Field, ObjectType } from '@nestjs/graphql';
import { type ObjectId } from 'mongoose';

@ObjectType()
export class Chat {
	@Field(() => String)
	_id: ObjectId;
	@Field(() => String)
	senderId: ObjectId;
	@Field(() => String)
	receiverId: ObjectId;
	@Field(() => String)
	message: string;
	@Field(() => Boolean)
	isRead: boolean;
	@Field(() => Date)
	createdAt: Date;
	@Field(() => Date)
	updatedAt: Date;
}

@ObjectType()
export class OnlineStatus {
	@Field(() => String)
	memberId: string;
	@Field(() => Boolean)
	isOnline: boolean;
}

@ObjectType()
export class Conversation {
	@Field(() => String)
	partnerId: string;
	@Field(() => String, { nullable: true })
	partnerNick?: string;
	@Field(() => String, { nullable: true })
	partnerImage?: string;
	@Field(() => String)
	lastMessage: string;
	@Field(() => Date)
	lastMessageAt: Date;
	@Field(() => Boolean)
	isRead: boolean;
	@Field(() => Boolean)
	isOnline: boolean;
}
