import { MemberService } from './member.service';
import { MemberAuthType, MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { Message } from '../../libs/enums/common.enum';
import { TelegramAuthInput } from '../../libs/dto/member/member.input';

/**
 * Unit tests for MemberService.telegramAuth and MemberService.linkTelegram.
 * The Mongoose model and AuthService are fully mocked; signature verification
 * itself is covered separately in auth.service.spec.ts.
 */
describe('MemberService — Telegram auth & linking', () => {
	let memberModel: any;
	let authService: any;
	let service: MemberService;

	const nowSec = (): number => Math.floor(Date.now() / 1000);

	const payload = (overrides: Partial<TelegramAuthInput> = {}): TelegramAuthInput =>
		({
			id: 555000111,
			first_name: 'Ali',
			auth_date: nowSec(),
			hash: 'verification-is-mocked',
			...overrides,
		}) as TelegramAuthInput;

	// A fake persisted member document (with a mocked .save()).
	const memberDoc = (overrides: Record<string, any> = {}): any => ({
		_id: 'member-id-1',
		memberStatus: MemberStatus.ACTIVE,
		memberAuthType: MemberAuthType.TELEGRAM,
		telegramId: 555000111,
		save: jest.fn().mockResolvedValue(true),
		...overrides,
	});

	// Helpers to wire findOne / findOneAndUpdate (both end in .exec()).
	const findOneResolves = (value: any) => memberModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(value) });
	const findOneAndUpdateResolves = (value: any) =>
		memberModel.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(value) });

	beforeEach(() => {
		memberModel = {
			findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
			findOneAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
			exists: jest.fn().mockResolvedValue(null), // nick free by default
			create: jest.fn().mockImplementation(async (doc: any) => ({ ...doc })),
		};
		authService = {
			verifyTelegramAuth: jest.fn(), // passes by default
			createToken: jest.fn().mockResolvedValue('signed.jwt.token'),
		};
		service = new MemberService(memberModel, {} as any, authService, {} as any, {} as any);
	});

	describe('telegramAuth', () => {
		// 1. Existing Telegram member → logs in, refreshes profile, issues token.
		it('logs in an existing active Telegram member', async () => {
			const existing = memberDoc({ memberStatus: MemberStatus.ACTIVE });
			findOneResolves(existing);

			const input = payload({ username: 'new_handle', photo_url: 'https://t.me/new.jpg' });
			const result = await service.telegramAuth(input);

			expect(memberModel.findOne).toHaveBeenCalledWith({ telegramId: input.id });
			expect(memberModel.create).not.toHaveBeenCalled();
			// Mutable Telegram bits refreshed + persisted.
			expect(existing.telegramUsername).toBe('new_handle');
			expect(existing.telegramPhotoUrl).toBe('https://t.me/new.jpg');
			expect(existing.telegramAuthDate).toBe(input.auth_date);
			expect(existing.save).toHaveBeenCalledTimes(1);
			expect(result).toBe(existing);
			expect(result.accessToken).toBe('signed.jwt.token');
		});

		// 2. New Telegram member → provisioned with TELEGRAM auth type + token.
		it('creates a new Telegram member when none exists', async () => {
			findOneResolves(null);

			const input = payload({ id: 999, first_name: 'Eve', username: 'eve', photo_url: 'https://t.me/eve.jpg' });
			const result = await service.telegramAuth(input);

			expect(memberModel.create).toHaveBeenCalledWith(
				expect.objectContaining({
					memberType: MemberType.USER,
					memberStatus: MemberStatus.ACTIVE,
					memberAuthType: MemberAuthType.TELEGRAM,
					memberNick: 'eve',
					memberFullName: 'Eve',
					memberImage: 'https://t.me/eve.jpg',
					telegramId: 999,
					telegramUsername: 'eve',
				}),
			);
			expect(result.accessToken).toBe('signed.jwt.token');
		});

		// 3. Blocked member → rejected, no save, no token.
		it('rejects a blocked Telegram member', async () => {
			const existing = memberDoc({ memberStatus: MemberStatus.BLOCK });
			findOneResolves(existing);

			await expect(service.telegramAuth(payload())).rejects.toThrow(Message.BLOCKED_USER);
			expect(existing.save).not.toHaveBeenCalled();
			expect(authService.createToken).not.toHaveBeenCalled();
		});

		// 4. Deleted member → rejected.
		it('rejects a deleted Telegram member', async () => {
			const existing = memberDoc({ memberStatus: MemberStatus.DELETE });
			findOneResolves(existing);

			await expect(service.telegramAuth(payload())).rejects.toThrow(Message.NO_MEMBER_NICK);
			expect(existing.save).not.toHaveBeenCalled();
		});

		// 7. Invalid Telegram payload → verification throws before any DB work.
		it('propagates an invalid-signature error and touches no DB', async () => {
			authService.verifyTelegramAuth.mockImplementation(() => {
				throw new Error(Message.TELEGRAM_AUTH_FAILED);
			});

			await expect(service.telegramAuth(payload())).rejects.toThrow(Message.TELEGRAM_AUTH_FAILED);
			expect(memberModel.findOne).not.toHaveBeenCalled();
			expect(memberModel.create).not.toHaveBeenCalled();
		});

		// create() failure (e.g. a concurrent duplicate telegramId hitting the unique index)
		// is mapped to a friendly USED_MEMBER_NICK_OR_PHONE error.
		it('maps a create() failure to USED_MEMBER_NICK_OR_PHONE', async () => {
			findOneResolves(null);
			memberModel.create.mockRejectedValue(new Error('E11000 duplicate key: telegramId'));

			await expect(service.telegramAuth(payload())).rejects.toThrow(Message.USED_MEMBER_NICK_OR_PHONE);
		});

		// 8. Nick collision handling.
		describe('nick generation', () => {
			it('falls back to tg_<id> when username is missing', async () => {
				findOneResolves(null);
				await service.telegramAuth(payload({ id: 42, username: undefined }));
				expect(memberModel.create).toHaveBeenCalledWith(expect.objectContaining({ memberNick: 'tg_42' }));
			});

			it('uses the username as nick when present and free', async () => {
				findOneResolves(null);
				await service.telegramAuth(payload({ username: 'ali_v' }));
				expect(memberModel.create).toHaveBeenCalledWith(expect.objectContaining({ memberNick: 'ali_v' }));
			});

			it('appends a numeric suffix when the preferred nick is taken', async () => {
				findOneResolves(null);
				memberModel.exists = jest
					.fn()
					.mockResolvedValueOnce({ _id: 'x' }) // ali_v   taken
					.mockResolvedValueOnce(null); //          ali_v_1 free
				await service.telegramAuth(payload({ username: 'ali_v' }));
				expect(memberModel.create).toHaveBeenCalledWith(expect.objectContaining({ memberNick: 'ali_v_1' }));
			});

			it('keeps appending until a free nick is found', async () => {
				findOneResolves(null);
				memberModel.exists = jest
					.fn()
					.mockResolvedValueOnce({ _id: 'x' }) // ali_v
					.mockResolvedValueOnce({ _id: 'y' }) // ali_v_1
					.mockResolvedValueOnce(null); //          ali_v_2 free
				await service.telegramAuth(payload({ username: 'ali_v' }));
				expect(memberModel.create).toHaveBeenCalledWith(expect.objectContaining({ memberNick: 'ali_v_2' }));
			});
		});
	});

	describe('linkTelegram', () => {
		const memberId = 'me-123' as any;

		// 6. Successful link → telegramId attached to the authenticated member.
		it('links Telegram to the authenticated member when the id is free', async () => {
			findOneResolves(null); // telegramId not used by anyone
			const updated = memberDoc({ _id: 'me-123', memberAuthType: MemberAuthType.PHONE });
			findOneAndUpdateResolves(updated);

			const input = payload({ username: 'ali_v' });
			const result = await service.linkTelegram(memberId, input);

			expect(memberModel.findOneAndUpdate).toHaveBeenCalledWith(
				{ _id: memberId, memberStatus: MemberStatus.ACTIVE },
				expect.objectContaining({ telegramId: input.id, telegramUsername: 'ali_v' }),
				{ new: true },
			);
			expect(result).toBe(updated);
			expect(result.accessToken).toBe('signed.jwt.token');
		});

		it('allows re-linking the same Telegram id to its own member', async () => {
			findOneResolves(memberDoc({ _id: 'me-123' })); // already owned by the SAME member
			const updated = memberDoc({ _id: 'me-123' });
			findOneAndUpdateResolves(updated);

			await expect(service.linkTelegram(memberId, payload())).resolves.toBe(updated);
		});

		// 5. Duplicate telegramId already linked to a different member → rejected.
		it('rejects when the Telegram id is already linked to another member', async () => {
			findOneResolves(memberDoc({ _id: 'someone-else' }));

			await expect(service.linkTelegram(memberId, payload())).rejects.toThrow(Message.TELEGRAM_ALREADY_LINKED);
			expect(memberModel.findOneAndUpdate).not.toHaveBeenCalled();
		});

		// 7. Invalid payload on link → verification throws first.
		it('propagates an invalid-signature error before any DB work', async () => {
			authService.verifyTelegramAuth.mockImplementation(() => {
				throw new Error(Message.TELEGRAM_AUTH_FAILED);
			});

			await expect(service.linkTelegram(memberId, payload())).rejects.toThrow(Message.TELEGRAM_AUTH_FAILED);
			expect(memberModel.findOne).not.toHaveBeenCalled();
			expect(memberModel.findOneAndUpdate).not.toHaveBeenCalled();
		});

		it('throws UPDATE_FAILED when the member is not found/active', async () => {
			findOneResolves(null);
			findOneAndUpdateResolves(null); // no active member matched

			await expect(service.linkTelegram(memberId, payload())).rejects.toThrow(Message.UPDATE_FAILED);
		});
	});
});
