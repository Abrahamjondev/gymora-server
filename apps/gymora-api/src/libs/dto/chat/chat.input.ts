import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class ChatInput {
	@IsOptional()
	@Field(() => String, { nullable: true })
	senderId?: string;
	@IsNotEmpty()
	@Field(() => String)
	receiverId: string;
	@IsNotEmpty()
	@Field(() => String)
	message: string;
}
