import { ObjectId } from 'bson';

export const availableTrainerSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews', 'memberRank'];
export const availableMemberSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews'];
export const availableCommentSorts = ['createdAt', 'updatedAt'];
/**IMAGE CONFIGURATION (config.js)**/
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { T } from './types/common';

export const escapeRegex = (value: string) => value.trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const publicMemberProjection = {
	memberType: 1,
	memberStatus: 1,
	memberAuthType: 1,
	memberNick: 1,
	memberFullName: 1,
	memberImage: 1,
	memberDesc: 1,
	memberCourses: 1,
	memberArticles: 1,
	memberWorkouts: 1,
	memberFollowers: 1,
	memberFollowings: 1,
	memberPoints: 1,
	memberLikes: 1,
	memberViews: 1,
	memberComments: 1,
	memberRank: 1,
	createdAt: 1,
	updatedAt: 1,
};

export const publicMemberSelect = Object.keys(publicMemberProjection).join(' ');

export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
export const getSerialForImage = (filename: string) => {
	const ext = path.parse(filename).ext;
	return uuidv4() + ext;
};

export const shapeIntoMongoObjectId = (target: any) => {
	return typeof target === 'string' ? new ObjectId(target) : target;
};

export const lookupAuthMemberLiked = (memberId: T, targetRefId: string = '$_id') => {
	return {
		$lookup: {
			from: 'likes',
			let: {
				localLikeRefId: targetRefId,
				localMemberId: memberId,
				localMyFavorite: true,
			},
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [{ $eq: ['$likeRefId', '$$localLikeRefId'] }, { $eq: ['$memberId', '$$localMemberId'] }],
						},
					},
				},
				{
					$project: {
						_id: 0,
						memberId: 1,
						likeRefId: 1,
						myFavorite: '$$localMyFavorite',
					},
				},
			],
			as: 'meLiked',
		},
	};
};

interface LookupAuthMemberFollowed {
	followerId: T;
	followingId: string;
}

export const lookupAuthMemberFollowed = (input: LookupAuthMemberFollowed) => {
	const { followerId, followingId } = input;
	return {
		$lookup: {
			from: 'follows',
			let: {
				localFollowerId: followerId,
				localFollowingId: followingId,
				localMyFavorite: true,
			},
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [{ $eq: ['$followerId', '$$localFollowerId'] }, { $eq: ['$followingId', '$$localFollowingId'] }],
						},
					},
				},
				{
					$project: {
						_id: 0,
						followerId: 1,
						followingId: 1,
						myFollowing: '$$localMyFavorite',
					},
				},
			],
			as: 'meFollowed',
		},
	};
};

export const lookupMember = {
	$lookup: {
		from: 'members',
		localField: 'memberId',
		foreignField: '_id',
		pipeline: [{ $project: publicMemberProjection }],
		as: 'memberData',
	},
};
export const lookupFollowingData = {
	$lookup: {
		from: 'members',
		localField: 'followingId',
		foreignField: '_id',
		pipeline: [{ $project: publicMemberProjection }],
		as: 'followingData',
	},
};

export const lookupFollowerData = {
	$lookup: {
		from: 'members',
		localField: 'followerId',
		foreignField: '_id',
		pipeline: [{ $project: publicMemberProjection }],
		as: 'followerData',
	},
};
