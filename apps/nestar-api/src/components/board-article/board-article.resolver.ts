import { Args, Query, Mutation, Resolver } from '@nestjs/graphql';
import { BoardArticleService } from './board-article.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { BoardArticle } from '../../libs/dto/board-article/board-article';
import { type ObjectId } from 'mongoose';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { BoardArticleInput } from '../../libs/dto/board-article/board-article.input';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectid } from '../../libs/config';

@Resolver()
export class BoardArticleResolver {
	constructor(private readonly boardArticleService: BoardArticleService) {}

	@UseGuards(AuthGuard)
	@Mutation((returns) => BoardArticle)
	public async createBoardArticle(
		@Args('input') input: BoardArticleInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<BoardArticle> {
		console.log('Mutation: createBoardArticle');

		return await this.boardArticleService.createBoardArticle(memberId, input);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => BoardArticle)
	public async getBoardArticle(
		@Args('articleId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<BoardArticle> {
		console.log('Query: getBoardArticle');
		const articleId = shapeIntoMongoObjectid(input);

		return await this.boardArticleService.getBoardArticle(memberId, articleId);
	}
}
