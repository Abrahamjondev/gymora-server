import * as crypto from 'crypto';
import { AuthService } from './auth.service';
import { Message } from '../../libs/enums/common.enum';
import { TelegramAuthInput } from '../../libs/dto/member/member.input';

/**
 * Unit tests for AuthService.verifyTelegramAuth — the HMAC verification of
 * Telegram Login Widget payloads. No Nest TestingModule is needed: the method
 * only depends on ConfigService (for the bot token), so we construct the
 * service directly with light mocks.
 */
describe('AuthService.verifyTelegramAuth', () => {
	const BOT_TOKEN = '123456:FAKE-TEST-BOT-TOKEN';

	// Build a service whose ConfigService returns the given token (undefined to simulate "missing").
	const makeService = (token: string | undefined = BOT_TOKEN): AuthService => {
		const jwtServiceMock = {} as any;
		const configServiceMock = { get: jest.fn().mockReturnValue(token) } as any;
		return new AuthService(jwtServiceMock, configServiceMock);
	};

	const nowSec = (): number => Math.floor(Date.now() / 1000);

	// Reproduces the exact server-side check-string + HMAC so we can forge VALID payloads.
	const signPayload = (data: Record<string, unknown>, token: string): string => {
		const checkString = Object.keys(data)
			.filter((k) => data[k] !== undefined && data[k] !== null)
			.sort()
			.map((k) => `${k}=${data[k]}`)
			.join('\n');
		const secret = crypto.createHash('sha256').update(token).digest();
		return crypto.createHmac('sha256', secret).update(checkString).digest('hex');
	};

	// A fresh, fully-valid payload (caller may override fields).
	const validPayload = (overrides: Partial<TelegramAuthInput> = {}): TelegramAuthInput => {
		const base = {
			id: 123456789,
			first_name: 'Ali',
			last_name: 'Valiyev',
			username: 'ali_v',
			photo_url: 'https://t.me/i/userpic/320/ali.jpg',
			auth_date: nowSec(),
			...overrides,
		};
		const hash = signPayload(base, BOT_TOKEN);
		return { ...base, hash } as TelegramAuthInput;
	};

	// 1. Valid payload → passes (returns void, does not throw).
	it('accepts a valid, fresh Telegram payload', () => {
		const service = makeService();
		expect(() => service.verifyTelegramAuth(validPayload())).not.toThrow();
	});

	// 2. Invalid hash (correct length, wrong content) → rejected.
	it('rejects a payload with an invalid hash', () => {
		const service = makeService();
		const payload = validPayload();
		const badHash = 'deadbeef'.repeat(8); // 64 hex chars = 32 bytes (same length as a real hash)
		expect(() => service.verifyTelegramAuth({ ...payload, hash: badHash })).toThrow(Message.TELEGRAM_AUTH_FAILED);
	});

	// 3. Expired auth_date → signature is valid but payload is stale.
	it('rejects a payload whose auth_date is older than the replay window', () => {
		const service = makeService();
		// Sign over the OLD auth_date so the signature itself is valid; only freshness fails.
		const payload = validPayload({ auth_date: nowSec() - 400 }); // > 300s window
		expect(() => service.verifyTelegramAuth(payload)).toThrow(Message.TELEGRAM_AUTH_EXPIRED);
	});

	// 4. Missing TELEGRAM_BOT_TOKEN → configuration error before any crypto work.
	it('throws when TELEGRAM_BOT_TOKEN is not configured', () => {
		const payload = validPayload();
		// Build directly with a config mock that returns the absent value (bypassing the
		// makeService default, which JS would substitute for an explicit `undefined`).
		const buildWithToken = (token: string | undefined): AuthService =>
			new AuthService({} as any, { get: jest.fn().mockReturnValue(token) } as any);

		expect(() => buildWithToken(undefined).verifyTelegramAuth(payload)).toThrow('TELEGRAM_BOT_TOKEN is not configured');
		expect(() => buildWithToken('').verifyTelegramAuth(payload)).toThrow('TELEGRAM_BOT_TOKEN is not configured');
		expect(() => buildWithToken('   ').verifyTelegramAuth(payload)).toThrow('TELEGRAM_BOT_TOKEN is not configured');
	});

	// 5. Payload tampering after hash generation → any mutated field breaks the signature.
	it('rejects a payload tampered with after the hash was generated', () => {
		const service = makeService();
		const payload = validPayload(); // hash signs first_name = 'Ali'
		const tampered = { ...payload, first_name: 'Eve' }; // attacker swaps identity, keeps old hash
		expect(() => service.verifyTelegramAuth(tampered)).toThrow(Message.TELEGRAM_AUTH_FAILED);

		// Tampering with the numeric id is likewise rejected.
		expect(() => service.verifyTelegramAuth({ ...payload, id: 999 })).toThrow(Message.TELEGRAM_AUTH_FAILED);
	});

	// 6. Timing-safe comparison path: must handle unequal-length hashes WITHOUT throwing a
	//    crypto RangeError (timingSafeEqual requires equal-length buffers), and must reject
	//    equal-length-but-wrong hashes via the constant-time compare.
	describe('timing-safe comparison', () => {
		it('rejects a hash of a different byte length via the length guard (no RangeError)', () => {
			const service = makeService();
			const payload = validPayload();
			// 'abcd' = 2 bytes vs the 32-byte expected hash → length guard, not timingSafeEqual.
			expect(() => service.verifyTelegramAuth({ ...payload, hash: 'abcd' })).toThrow(Message.TELEGRAM_AUTH_FAILED);
			// An empty hash is also handled gracefully.
			expect(() => service.verifyTelegramAuth({ ...payload, hash: '' })).toThrow(Message.TELEGRAM_AUTH_FAILED);
		});

		it('rejects an equal-length but incorrect hash via constant-time compare', () => {
			const service = makeService();
			const payload = validPayload();
			const expected = signPayload(
				{ ...payload, hash: undefined }, // recompute the real hash
				BOT_TOKEN,
			);
			// Flip the first hex nibble so length stays 64 but content differs.
			const flipped = (expected[0] === '0' ? '1' : '0') + expected.slice(1);
			expect(flipped).toHaveLength(expected.length);
			expect(() => service.verifyTelegramAuth({ ...payload, hash: flipped })).toThrow(Message.TELEGRAM_AUTH_FAILED);
		});
	});
});
