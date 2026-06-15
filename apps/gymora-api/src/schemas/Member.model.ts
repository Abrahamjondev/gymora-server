import { Schema } from 'mongoose';
import { MemberAuthType, MemberStatus, MemberType } from '../libs/enums/member.enum';

const MemberSchema = new Schema(
	{
		memberType: {
			type: String,
			enum: MemberType,
			default: MemberType.USER,
		},
		memberStatus: {
			type: String,
			enum: MemberStatus,
			default: MemberStatus.ACTIVE,
		},
		memberAuthType: {
			type: String,
			enum: MemberAuthType,
			default: MemberAuthType.PHONE,
		},
		memberPhone: {
			type: String,
			index: { unique: true, sparse: true },
			// Telegram members have no phone; required for every other auth type.
			required: function (this: any): boolean {
				return this.memberAuthType !== MemberAuthType.TELEGRAM;
			},
		},
		memberNick: {
			type: String,
			index: { unique: true, sparse: true },
			required: true,
		},
		memberPassword: {
			type: String,
			select: false,
			// Telegram members authenticate via signature, not a password.
			required: function (this: any): boolean {
				return this.memberAuthType !== MemberAuthType.TELEGRAM;
			},
		},
		// --- Telegram Login Widget identity ---
		telegramId: {
			type: Number,
			index: { unique: true, sparse: true },
		},
		telegramUsername: {
			type: String,
		},
		telegramPhotoUrl: {
			type: String,
		},
		// Last verified Telegram auth_date (epoch seconds) — replay defense.
		telegramAuthDate: {
			type: Number,
		},
		memberFullName: {
			type: String,
		},
		memberImage: {
			type: String,
			default: '',
		},
		memberAddress: {
			type: String,
		},
		memberDesc: {
			type: String,
		},
		memberCourses: {
			type: Number,
			default: 0,
		},
		memberArticles: { type: Number, default: 0 },
		memberWorkouts: {
			type: Number,
			default: 0,
		},
		memberFollowers: {
			type: Number,
			default: 0,
		},
		memberFollowings: {
			type: Number,
			default: 0,
		},
		memberPoints: {
			type: Number,
			default: 0,
		},
		memberLikes: {
			type: Number,
			default: 0,
		},
		memberViews: {
			type: Number,
			default: 0,
		},
		memberComments: {
			type: Number,
			default: 0,
		},
		memberRank: {
			type: Number,
			default: 0,
		},
		memberWarnings: {
			type: Number,
			default: 0,
		},

		memberBlocks: {
			type: Number,
			default: 0,
		},
		deletedAt: {
			type: Date,
		},
		// Stamped by ChatService on socket connect/disconnect so "last seen"
		// survives server restarts (the live presence Set is in-memory only).
		lastSeenAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'members' },
);

export default MemberSchema;
