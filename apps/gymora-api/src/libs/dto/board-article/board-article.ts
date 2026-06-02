import { Field, Int, ObjectType } from '@nestjs/graphql';
import { type ObjectId } from 'mongoose';
import { BoardArticleCategory, BoardArticleStatus } from '../../enums/gymora.enum';
import { TotalCounter } from '../member/member';

@ObjectType()
class ArticleMemberData {
	@Field(() => String) _id: ObjectId;
	@Field(() => String) memberNick: string;
	@Field(() => String, { nullable: true }) memberImage?: string;
	@Field(() => String) memberType: string;
}

@ObjectType()
class ArticleMeLiked {
	@Field(() => String) memberId: ObjectId;
	@Field(() => String) likeRefId: ObjectId;
	@Field(() => Boolean) myFavorite: boolean;
}

@ObjectType()
export class BoardArticle {
	@Field(() => String) _id: ObjectId;
	@Field(() => BoardArticleCategory) articleCategory: BoardArticleCategory;
	@Field(() => BoardArticleStatus) articleStatus: BoardArticleStatus;
	@Field(() => String) articleTitle: string;
	@Field(() => String) articleContent: string;
	@Field(() => String, { nullable: true }) articleImage?: string;
	@Field(() => Int, { nullable: true }) articleViews?: number;
	@Field(() => Int, { nullable: true }) articleLikes?: number;
	@Field(() => Int, { nullable: true }) articleComments?: number;
	@Field(() => String) memberId: ObjectId;
	@Field(() => Date) createdAt: Date;
	@Field(() => Date) updatedAt: Date;
	@Field(() => ArticleMemberData, { nullable: true }) memberData?: ArticleMemberData;
	@Field(() => [ArticleMeLiked], { nullable: true }) meLiked?: ArticleMeLiked[];
}

@ObjectType()
export class BoardArticles {
	@Field(() => [BoardArticle]) list: BoardArticle[];
	@Field(() => [TotalCounter], { nullable: true }) metaCounter: TotalCounter[];
}
