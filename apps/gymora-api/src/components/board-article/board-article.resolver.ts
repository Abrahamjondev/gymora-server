import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BoardArticle, BoardArticles } from '../../libs/dto/board-article/board-article';
import { BoardArticleInput, BoardArticleUpdate, BoardArticlesInquiry } from '../../libs/dto/board-article/board-article.input';
import { BoardArticleService } from './board-article.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { WithoutGuard } from '../auth/guards/without.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';

@Resolver()
export class BoardArticleResolver {
	constructor(private readonly articleService: BoardArticleService) {}

	@Roles(MemberType.TRAINER, MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => BoardArticle)
	public async createBoardArticle(
		@Args('input') input: BoardArticleInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<BoardArticle> {
		return await this.articleService.createArticle(memberId.toString(), input);
	}

	@UseGuards(WithoutGuard)
	@Query(() => BoardArticle)
	public async getBoardArticle(
		@Args('articleId') articleId: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<BoardArticle> {
		return await this.articleService.getArticle(memberId?.toString() ?? null, articleId);
	}

	@UseGuards(WithoutGuard)
	@Query(() => BoardArticles)
	public async getBoardArticles(
		@Args('input') input: BoardArticlesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<BoardArticles> {
		return await this.articleService.getArticles(memberId?.toString() ?? null, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => BoardArticle)
	public async likeBoardArticle(
		@Args('articleId') articleId: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<BoardArticle> {
		return await this.articleService.likeArticle(memberId.toString(), articleId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => BoardArticle)
	public async updateBoardArticle(
		@Args('input') input: BoardArticleUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<BoardArticle> {
		return await this.articleService.updateArticle(memberId.toString(), input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => BoardArticle)
	public async deleteBoardArticleByAdmin(@Args('articleId') articleId: string): Promise<BoardArticle> {
		return await this.articleService.deleteArticleByAdmin(articleId);
	}
}
