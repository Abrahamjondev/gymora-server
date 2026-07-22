import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Member } from '../../libs/dto/member/member';
import { T } from '../../libs/types/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { TelegramAuthInput } from '../../libs/dto/member/member.input';
import { Message } from '../../libs/enums/common.enum';

// Telegram Login Widget payloads older than this (seconds) are rejected as replays.
const TELEGRAM_AUTH_MAX_AGE_SEC = 300;

@Injectable()
export class AuthService {
	constructor(
		private jwtService: JwtService,
		private configService: ConfigService,
	) {}

	public async hashPassword(memberPassword: string): Promise<string> {
		const salt = await bcrypt.genSalt();

		return await bcrypt.hash(memberPassword, salt);
	}
	public async comparePassword(passwords: string, hashedPassword: string): Promise<boolean> {
		return await bcrypt.compare(passwords, hashedPassword);
	}
	public async createToken(member: Member): Promise<string> {
		const source = member['_doc'] ? member['_doc'] : member;
		// JWTs are signed, not encrypted. Keep only identity and authorization
		// claims; private profile and moderation fields stay behind authenticated
		// GraphQL reads.
		const payload: T = {
			_id: source._id?.toString(),
			memberType: source.memberType,
			memberStatus: source.memberStatus,
			memberAuthType: source.memberAuthType,
			memberNick: source.memberNick,
			memberFullName: source.memberFullName,
			memberImage: source.memberImage,
			memberDesc: source.memberDesc,
			memberCourses: source.memberCourses,
			memberArticles: source.memberArticles,
			memberWorkouts: source.memberWorkouts,
			memberRank: source.memberRank,
			memberPoints: source.memberPoints,
			memberLikes: source.memberLikes,
			memberViews: source.memberViews,
		};

		return await this.jwtService.signAsync(payload);
	}
	public async verifyToken(token: string): Promise<Member> {
		const member = await this.jwtService.verifyAsync(token);
		member._id = shapeIntoMongoObjectId(member._id);
		return member;
	}

	/**
	 * Verifies a Telegram Login Widget payload.
	 * Algorithm (https://core.telegram.org/widgets/login#checking-authorization):
	 *   secret_key   = SHA256(bot_token)
	 *   check_string = sorted "key=value" pairs (all fields except `hash`) joined by "\n"
	 *   expected     = HMAC_SHA256(check_string, secret_key)
	 *   valid        = timingSafeEqual(expected, hash) AND auth_date is fresh
	 * Throws on failure so callers don't have to branch on a boolean.
	 */
	public verifyTelegramAuth(input: TelegramAuthInput): void {
		const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
		if (!botToken || botToken.trim() === '') {
			throw new InternalServerErrorException('TELEGRAM_BOT_TOKEN is not configured.');
		}

		const { hash, ...fields } = input;

		// Build the data-check-string: every provided field except `hash`,
		// keys sorted alphabetically, formatted as `key=value`, joined by "\n".
		const dataCheckString = Object.keys(fields)
			.filter((key) => fields[key] !== undefined && fields[key] !== null)
			.sort()
			.map((key) => `${key}=${fields[key]}`)
			.join('\n');

		const secretKey = crypto.createHash('sha256').update(botToken).digest();
		const expectedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

		const expectedBuf = Buffer.from(expectedHash, 'hex');
		const actualBuf = Buffer.from(hash, 'hex');
		if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
			throw new InternalServerErrorException(Message.TELEGRAM_AUTH_FAILED);
		}

		// Replay defense: reject stale payloads.
		const nowSec = Math.floor(Date.now() / 1000);
		if (nowSec - input.auth_date > TELEGRAM_AUTH_MAX_AGE_SEC) {
			throw new InternalServerErrorException(Message.TELEGRAM_AUTH_EXPIRED);
		}
	}
}
