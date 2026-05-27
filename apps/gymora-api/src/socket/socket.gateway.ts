import { Logger, UnauthorizedException } from '@nestjs/common';
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatInput } from '../libs/dto/chat/chat.input';
import { ChatService } from '../components/chat/chat.service';
import { AuthService } from '../components/auth/auth.service';
import { Member } from '../libs/dto/member/member';
import { Message } from '../libs/enums/common.enum';

type AuthenticatedSocket = Socket & {
	data: Socket['data'] & {
		authMember?: Member;
		memberId?: string;
	};
};

@WebSocketGateway({
	transports: ['websocket'],
	cors: { origin: true, credentials: true },
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private logger: Logger = new Logger('SocketEventsGateway');
	private summaryClient: number = 0;

	constructor(
		private readonly chatService: ChatService,
		private readonly authService: AuthService,
	) {}

	public afterInit(server: Server) {
		this.logger.log(`WebSocket Server Initialized total: ${this.summaryClient}`);
	}

	public async handleConnection(client: AuthenticatedSocket): Promise<void> {
		try {
			const token = this.extractToken(client);
			const authMember = await this.authService.verifyToken(token);
			const memberId = authMember._id.toString();

			client.data.authMember = authMember;
			client.data.memberId = memberId;

			this.summaryClient++;
			this.chatService.registerConnection(memberId, client.id);
			this.logger.verbose(`== Client connected member: ${memberId} total: ${this.summaryClient} ==`);
		} catch (err) {
			this.logger.warn(`Unauthorized socket connection rejected: ${err instanceof Error ? err.message : Message.NOT_AUTHENTICATED}`);
			client.emit('exception', new UnauthorizedException(Message.NOT_AUTHENTICATED).getResponse());
			client.disconnect(true);
			throw new WsException(Message.NOT_AUTHENTICATED);
		}
	}

	public handleDisconnect(client: AuthenticatedSocket): void {
		const memberId = client.data?.memberId;
		if (memberId) this.chatService.unregisterConnection(memberId, client.id);
		this.summaryClient = Math.max(this.summaryClient - 1, 0);
		this.logger.warn(`== Client disconnected member: ${memberId ?? 'unknown'} left total: ${this.summaryClient} ==`);
	}

	@SubscribeMessage('chat:message')
	public async handleChatMessage(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() payload: ChatInput) {
		const senderId = this.getAuthenticatedMemberId(client);
		return await this.chatService.sendMessage({
			...payload,
			senderId,
		});
	}

	@SubscribeMessage('chat:online')
	public handleChatOnline(@ConnectedSocket() client: AuthenticatedSocket) {
		const memberId = this.getAuthenticatedMemberId(client);
		return this.chatService.getOnlineStatus(memberId);
	}

	private extractToken(client: AuthenticatedSocket): string {
		const authToken = client.handshake?.auth?.token;
		const bearerToken = client.handshake?.headers?.authorization;
		const token = authToken ?? (bearerToken?.startsWith('Bearer ') ? bearerToken.split(' ')[1] : bearerToken);
		if (!token) throw new UnauthorizedException(Message.TOKEN_NOT_EXIST);
		return token;
	}

	private getAuthenticatedMemberId(client: AuthenticatedSocket): string {
		const memberId = client.data?.memberId;
		if (!memberId) throw new WsException(Message.NOT_AUTHENTICATED);
		return memberId;
	}
}
