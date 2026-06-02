import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BoardArticle, BoardArticles } from '../../libs/dto/board-article/board-article';
import { BoardArticleInput, BoardArticleUpdate, BoardArticlesInquiry } from '../../libs/dto/board-article/board-article.input';
import { Message, Direction } from '../../libs/enums/common.enum';
import { BoardArticleStatus } from '../../libs/enums/gymora.enum';

@Injectable()
export class BoardArticleService {
	constructor(
		@InjectModel('BoardArticle') private readonly articleModel: Model<BoardArticle>,
		@InjectModel('Member') private readonly memberModel: Model<any>,
		@InjectModel('Like') private readonly likeModel: Model<any>,
		@InjectModel('View') private readonly viewModel: Model<any>,
	) {}

	public async createArticle(memberId: string, input: BoardArticleInput): Promise<BoardArticle> {
		const data = { ...input, memberId };
		const result = await this.articleModel.create(data);
		await this.memberModel.findByIdAndUpdate(memberId, { $inc: { memberArticles: 1 } }).exec();
		return result;
	}

	public async getArticle(memberId: string | null, articleId: string): Promise<BoardArticle> {
		const article = await this.articleModel.findOne({ _id: articleId, articleStatus: BoardArticleStatus.ACTIVE }).lean().exec();
		if (!article) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (memberId) {
			const aId = new Types.ObjectId(articleId);
			const mId = new Types.ObjectId(memberId);
			const viewed = await this.viewModel.findOne({ memberId: mId, viewRefId: aId });
			if (!viewed) {
				await this.viewModel.create({ memberId: mId, viewRefId: aId, viewGroup: 'ARTICLE' });
				await this.articleModel.findByIdAndUpdate(articleId, { $inc: { articleViews: 1 } });
				(article as any).articleViews = ((article as any).articleViews ?? 0) + 1;
			}
			const liked = await this.likeModel.findOne({ memberId: mId, likeRefId: aId });
			if (liked) (article as any).meLiked = [{ memberId: mId, likeRefId: aId, myFavorite: true }];
		}

		const member: any = await this.memberModel.findById((article as any).memberId).lean();
		if (member) {
			(article as any).memberData = {
				_id: member._id,
				memberNick: member.memberNick,
				memberImage: member.memberImage,
				memberType: member.memberType,
			};
		}
		return article as any;
	}

	public async getArticles(memberId: string | null, input: BoardArticlesInquiry): Promise<BoardArticles> {
		const { page, limit, sort, direction, search } = input;
		const match: any = { articleStatus: BoardArticleStatus.ACTIVE };

		if (search.articleCategory) match.articleCategory = search.articleCategory;
		if (search.text) match.articleTitle = { $regex: new RegExp(search.text, 'i') };
		if (search.memberId) match.memberId = new Types.ObjectId(search.memberId);

		const sortKey = sort ?? 'createdAt';
		const sortDir = (direction ?? Direction.DESC) as 1 | -1;
		const mId = memberId ? new Types.ObjectId(memberId) : null;

		const result = await this.articleModel.aggregate([
			{ $match: match },
			{ $sort: { [sortKey]: sortDir } },
			{
				$facet: {
					list: [
						{ $skip: (page - 1) * limit },
						{ $limit: limit },
						{
							$lookup: {
								from: 'members',
								localField: 'memberId',
								foreignField: '_id',
								as: 'memberArr',
							},
						},
						{
							$addFields: {
								memberData: {
									$cond: {
										if: { $gt: [{ $size: '$memberArr' }, 0] },
										then: {
											_id: { $arrayElemAt: ['$memberArr._id', 0] },
											memberNick: { $arrayElemAt: ['$memberArr.memberNick', 0] },
											memberImage: { $arrayElemAt: ['$memberArr.memberImage', 0] },
											memberType: { $arrayElemAt: ['$memberArr.memberType', 0] },
										},
										else: null,
									},
								},
							},
						},
						{ $project: { memberArr: 0 } },
						...(mId ? [{
							$lookup: {
								from: 'likes',
								let: { rid: '$_id', mid: mId },
								pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$likeRefId', '$$rid'] }, { $eq: ['$memberId', '$$mid'] }] } } }],
								as: 'meLiked',
							},
						}, {
							$addFields: {
								meLiked: {
									$map: { input: '$meLiked', as: 'l', in: { memberId: '$$l.memberId', likeRefId: '$$l.likeRefId', myFavorite: true } },
								},
							},
						}] : []),
					],
					metaCounter: [{ $count: 'total' }],
				},
			},
		]).exec();

		if (!result.length) return { list: [], metaCounter: [{ total: 0 }] };
		return result[0];
	}

	public async likeArticle(memberId: string, articleId: string): Promise<BoardArticle> {
		const aId = new Types.ObjectId(articleId);
		const mId = new Types.ObjectId(memberId);

		const existing = await this.likeModel.findOne({ memberId: mId, likeRefId: aId });
		let modifier: number;
		if (existing) {
			await this.likeModel.findByIdAndDelete(existing._id);
			modifier = -1;
		} else {
			await this.likeModel.create({ memberId: mId, likeRefId: aId, likeGroup: 'ARTICLE' });
			modifier = 1;
		}
		const result = await this.articleModel.findByIdAndUpdate(articleId, { $inc: { articleLikes: modifier } }, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}

	public async updateArticle(memberId: string, input: BoardArticleUpdate): Promise<BoardArticle> {
		const { _id, articleStatus, ...rest } = input;
		const result = await this.articleModel
			.findOneAndUpdate({ _id, memberId, articleStatus: BoardArticleStatus.ACTIVE }, { articleStatus, ...rest }, { new: true })
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		if (articleStatus === BoardArticleStatus.DELETE) {
			await this.memberModel.findByIdAndUpdate(memberId, { $inc: { memberArticles: -1 } }).exec();
		}
		return result;
	}

	public async deleteArticleByAdmin(articleId: string): Promise<BoardArticle> {
		const result = await this.articleModel.findByIdAndDelete(articleId).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
		return result;
	}
}
