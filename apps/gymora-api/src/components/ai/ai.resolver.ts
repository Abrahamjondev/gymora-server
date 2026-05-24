import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { AIAnalyze } from '../../libs/dto/ai/ai';
import { AiService } from './ai.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { getSerialForImage, validMimeTypes } from '../../libs/config';
import { Message } from '../../libs/enums/common.enum';
import type { ObjectId } from 'mongoose';

@Resolver()
export class AiResolver {
	constructor(private readonly aiService: AiService) {}

	@UseGuards(AuthGuard)
	@Mutation(() => AIAnalyze)
	public async analyzeFoodImage(
		@AuthMember('_id') memberId: ObjectId,
		@Args({ name: 'file', type: () => GraphQLUpload })
		{ createReadStream, filename, mimetype }: FileUpload,
	): Promise<AIAnalyze> {
		if (!filename) throw new BadRequestException(Message.UPLOAD_FAILED);
		if (!validMimeTypes.includes(mimetype)) throw new BadRequestException(Message.PROVIDE_ALLOWED_FORMAT);

		await mkdir('uploads/meals', { recursive: true });
		const imageName = getSerialForImage(filename);
		const imageUrl = `uploads/meals/${imageName}`;
		const imageBuffer = await this.uploadToBufferAndFile(createReadStream(), imageUrl);

		return await this.aiService.analyzeFoodImage(memberId.toString(), imageUrl, imageBuffer, mimetype);
	}

	@UseGuards(AuthGuard)
	@Query(() => [AIAnalyze])
	public async getAIAnalyzeHistory(@AuthMember('_id') memberId: ObjectId): Promise<AIAnalyze[]> {
		return await this.aiService.getAIAnalyzeHistory(memberId.toString());
	}

	private async uploadToBufferAndFile(stream: NodeJS.ReadableStream, imageUrl: string): Promise<Buffer> {
		const chunks: Buffer[] = [];
		const writeStream = createWriteStream(imageUrl);

		return await new Promise((resolve, reject) => {
			stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
			stream.on('error', () => reject(new BadRequestException(Message.UPLOAD_FAILED)));
			writeStream.on('error', () => reject(new BadRequestException(Message.UPLOAD_FAILED)));
			writeStream.on('finish', () => resolve(Buffer.concat(chunks)));
			stream.pipe(writeStream);
		});
	}
}
