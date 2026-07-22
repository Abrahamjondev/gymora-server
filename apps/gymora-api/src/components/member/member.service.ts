import { BadGatewayException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Member, Members } from '../../libs/dto/member/member';
import { LoginInput, MemberInput, MembersInquiry, TelegramAuthInput, TrainersInquiry } from '../../libs/dto/member/member.input';
import { MemberAuthType, MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { AuthService } from '../auth/auth.service';
import { MemberUpdate, MemberUpdateByAdmin } from '../../libs/dto/member/member.update';
import { ViewService } from '../view/view.service';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewInput } from '../../libs/dto/view/view.input';
import { StatisticModifier, T } from '../../libs/types/common';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeService } from '../like/like.service';
import { Follower, Following, MeFollowed } from '../../libs/dto/follow/follow';
import { escapeRegex, lookupAuthMemberLiked, publicMemberProjection, publicMemberSelect } from '../../libs/config';

@Injectable()
export class MemberService {
	constructor(
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		@InjectModel('Follow') private readonly followModel: Model<Follower | Following>,
		private authService: AuthService,
		private viewService: ViewService,
		private likeService: LikeService,
	) {}

	public async signup(input: MemberInput): Promise<Member> {
		input.memberPassword = await this.authService.hashPassword(input.memberPassword);
		try {
			const result = await this.memberModel.create({
				...input,
				memberType: MemberType.USER,
				memberStatus: MemberStatus.ACTIVE,
			});
			result.accessToken = await this.authService.createToken(result);

			return result;
		} catch (err: any) {
			console.log('Error, service model', err.message);
			throw new BadGatewayException(Message.USED_MEMBER_NICK_OR_PHONE);
		}
	}
	public async login(input: LoginInput): Promise<Member> {
		const { memberNick, memberPassword } = input;
		const response = await this.memberModel.findOne({ memberNick: memberNick }).select('+memberPassword').exec();

		if (!response || response.memberStatus === MemberStatus.DELETE) {
			throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
		} else if (response.memberStatus === MemberStatus.BLOCK) {
			throw new InternalServerErrorException(Message.BLOCKED_USER);
		} else if (response.memberAuthType === MemberAuthType.TELEGRAM || !response.memberPassword) {
			// Telegram-only accounts have no password — block password login outright.
			throw new InternalServerErrorException(Message.TELEGRAM_LOGIN_ONLY);
		}

		const isMatch = await this.authService.comparePassword(input.memberPassword, response.memberPassword);
		if (!isMatch) throw new InternalServerErrorException(Message.WRONG_PASSWORD);
		response.accessToken = await this.authService.createToken(response);

		return response;
	}

	/**
	 * Telegram Login Widget entry point.
	 * Verifies the signature, then logs in an existing Telegram member (by telegramId)
	 * or provisions a brand-new standalone TELEGRAM account.
	 */
	public async telegramAuth(input: TelegramAuthInput): Promise<Member> {
		this.authService.verifyTelegramAuth(input);

		const existing = await this.memberModel.findOne({ telegramId: input.id }).exec();
		if (existing) {
			if (existing.memberStatus === MemberStatus.DELETE) throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
			if (existing.memberStatus === MemberStatus.BLOCK) throw new InternalServerErrorException(Message.BLOCKED_USER);

			// Refresh mutable Telegram profile bits + replay timestamp.
			existing.telegramUsername = input.username;
			existing.telegramPhotoUrl = input.photo_url;
			existing.telegramAuthDate = input.auth_date;
			await existing.save();

			existing.accessToken = await this.authService.createToken(existing);
			return existing;
		}

		try {
			const memberNick = await this.generateUniqueNick(input.username, input.id);
			const created = await this.memberModel.create({
				memberType: MemberType.USER,
				memberStatus: MemberStatus.ACTIVE,
				memberAuthType: MemberAuthType.TELEGRAM,
				memberNick,
				memberFullName: [input.first_name, input.last_name].filter(Boolean).join(' ') || undefined,
				memberImage: input.photo_url ?? '',
				telegramId: input.id,
				telegramUsername: input.username,
				telegramPhotoUrl: input.photo_url,
				telegramAuthDate: input.auth_date,
			});
			created.accessToken = await this.authService.createToken(created);
			return created;
		} catch (err: any) {
			console.log('Error, telegramAuth model', err.message);
			throw new BadGatewayException(Message.USED_MEMBER_NICK_OR_PHONE);
		}
	}

	/**
	 * Opt-in linking: attach a verified Telegram identity to an already authenticated member.
	 * Keeps accounts separate by default; never auto-merges at login time.
	 */
	public async linkTelegram(memberId: ObjectId, input: TelegramAuthInput): Promise<Member> {
		this.authService.verifyTelegramAuth(input);

		const taken = await this.memberModel.findOne({ telegramId: input.id }).exec();
		if (taken && taken._id.toString() !== memberId.toString()) {
			throw new InternalServerErrorException(Message.TELEGRAM_ALREADY_LINKED);
		}

		const result = await this.memberModel
			.findOneAndUpdate(
				{ _id: memberId, memberStatus: MemberStatus.ACTIVE },
				{
					telegramId: input.id,
					telegramUsername: input.username,
					telegramPhotoUrl: input.photo_url,
					telegramAuthDate: input.auth_date,
				},
				{ new: true },
			)
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		result.accessToken = await this.authService.createToken(result);
		return result;
	}

	/** Derive a unique memberNick for a Telegram signup (username preferred, tg_<id> fallback). */
	private async generateUniqueNick(username: string | undefined, telegramId: number): Promise<string> {
		const base = (username && username.trim()) || `tg_${telegramId}`;
		let candidate = base;
		let suffix = 0;
		// Collision-safe: append an incrementing suffix until the nick is free.
		while (await this.memberModel.exists({ memberNick: candidate })) {
			suffix += 1;
			candidate = `${base}_${suffix}`;
		}
		return candidate;
	}

	public async updateMember(memberId: ObjectId, input: MemberUpdate): Promise<Member> {
		if (input.memberPassword) {
			input.memberPassword = await this.authService.hashPassword(input.memberPassword);
		}
		const result = await this.memberModel
			.findOneAndUpdate({ _id: memberId, memberStatus: MemberStatus.ACTIVE }, input, { new: true })
			.exec();
		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}
		result.accessToken = await this.authService.createToken(result);
		return result;
	}
	public async getMember(memberId: ObjectId, targetId: ObjectId): Promise<Member> {
		const search: T = {
			_id: targetId,
			memberStatus: MemberStatus.ACTIVE,
		};
		const targetMember = await this.memberModel.findOne(search).select(publicMemberSelect).lean().exec();
		if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (memberId) {
			//record view
			const viewInput: ViewInput = { memberId: memberId, viewRefId: targetId, viewGroup: ViewGroup.MEMBER };
			const newView = await this.viewService.recordView(viewInput);
			//increase view
			if (newView) {
				await this.memberModel.findOneAndUpdate({ _id: targetId }, { $inc: { memberViews: 1 } }, { new: true }).exec();
				targetMember.memberViews++;
			}
			//meliked
			const likeInput = { memberId: memberId, likeRefId: targetId, likeGroup: LikeGroup.MEMBER };
			targetMember.meLiked = await this.likeService.checkLikeExistence(likeInput);
			//mefollowed
			targetMember.meFollowed = await this.checkSubscription(memberId, targetId);
		}
		return targetMember;
	}

	public async getMyMember(memberId: ObjectId): Promise<Member> {
		const member = await this.memberModel
			.findOne({ _id: memberId, memberStatus: MemberStatus.ACTIVE })
			.select('+memberPhone +memberAddress')
			.lean()
			.exec();
		if (!member) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return member;
	}
	private async checkSubscription(followerId: ObjectId, followingId: ObjectId): Promise<MeFollowed[]> {
		const result = await this.followModel.findOne({ followingId: followingId, followerId: followerId }).exec();

		return result ? [{ followerId: followerId, followingId: followingId, myFollowing: true }] : [];
	}

	public async getTrainers(memberId: ObjectId, input: TrainersInquiry): Promise<Members> {
		const { text } = input.search;
		const match: T = {
			memberType: MemberType.TRAINER,
			memberStatus: MemberStatus.ACTIVE,
		};
		const sort: T = { [input.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };
		//inputtan kelayotgan direction boyicha saralymiz
		//agar berilmagan bolsa ozimiz belgilagan boyicha descending boyicha saralaymiz

		if (text) {
			const safeText = escapeRegex(text);
			match.$or = [{ memberNick: { $regex: new RegExp(safeText, 'i') } }, { memberFullName: { $regex: new RegExp(safeText, 'i') } }];
		}

		const result = await this.memberModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					// FACET bu MongoDB aggregate ning pipeline bosqichi (stage).
					// U bir xil ma'lumotga bir vaqtda bir nechta amal qilish imkonini beradi.
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupAuthMemberLiked(memberId),
							{ $project: { ...publicMemberProjection, meLiked: 1 } },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async likeTargetMember(memberId: ObjectId, likeRefId: ObjectId): Promise<Member> {
		if (memberId.toString() === likeRefId.toString()) {
			throw new InternalServerErrorException(Message.SELF_SUBSCRIPTION_DENIED);
		}
		const target: Member = await this.memberModel.findOne({ _id: likeRefId, memberStatus: MemberStatus.ACTIVE }).exec();

		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.MEMBER,
		};

		// LIKE TOGGLE via Like modules
		const modifier: number = await this.likeService.toggleLike(input);
		const result = await this.memberStatsEditor({
			_id: likeRefId,
			targetKey: 'memberLikes',
			modifier: modifier,
		});

		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);

		return result;
	}

	public async getAllMembersByAdmin(input: MembersInquiry): Promise<Members> {
		const { memberStatus, memberType, text } = input.search;
		const match: T = {};
		const sort: T = { [input.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (memberStatus) match.memberStatus = memberStatus;
		if (memberType) match.memberType = memberType;
		if (text) match.memberNick = { $regex: new RegExp(escapeRegex(text), 'i') };

		const result = await this.memberModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async updateMemberByAdmin(input: MemberUpdateByAdmin): Promise<Member> {
		const result = await this.memberModel.findByIdAndUpdate(input._id, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		return result;
	}

	public async memberStatsEditor(input: StatisticModifier): Promise<Member> {
		console.log('executed');

		const { _id, targetKey, modifier } = input;
		return await this.memberModel
			.findByIdAndUpdate(
				_id,
				{
					$inc: { [targetKey]: modifier },
				},
				{ new: true },
			)
			.exec();
	}
}
