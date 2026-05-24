import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { ChatModule } from '../components/chat/chat.module';
import { AuthModule } from '../components/auth/auth.module';

@Module({
	imports: [ChatModule, AuthModule],
	providers: [SocketGateway],
})
export class SocketModule {}
