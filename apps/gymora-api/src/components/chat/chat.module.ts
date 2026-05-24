import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import ChatSchema from '../../schemas/Chat.model';
import { ChatResolver } from './chat.resolver';
import { ChatService } from './chat.service';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Chat', schema: ChatSchema }]), AuthModule],
	providers: [ChatResolver, ChatService],
	exports: [ChatService],
})
export class ChatModule {}
