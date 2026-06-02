import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Lesson } from '../../libs/dto/lesson/lesson';
import { LessonProgress } from '../../libs/dto/lesson/lesson.progress';
import { LessonInput, LessonUpdate } from '../../libs/dto/lesson/lesson.input';
import { LessonService } from './lesson.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { getSerialForImage } from '../../libs/config';
import { Message } from '../../libs/enums/common.enum';
import type { ObjectId } from 'mongoose';

const validVideoMimes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];

@Resolver()
export class LessonResolver {
	constructor(private readonly lessonService: LessonService) {}

	@Roles(MemberType.TRAINER)
	@UseGuards(RolesGuard)
	@Mutation(() => Lesson)
	public async createLesson(
		@Args('input') input: LessonInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Lesson> {
		return await this.lessonService.createLesson(memberId.toString(), input);
	}

	@Query(() => [Lesson])
	public async getLessonsByCourse(@Args('courseId') courseId: string): Promise<Lesson[]> {
		return await this.lessonService.getLessonsByCourse(courseId);
	}

	@Roles(MemberType.TRAINER)
	@UseGuards(RolesGuard)
	@Mutation(() => Lesson)
	public async updateLesson(
		@Args('input') input: LessonUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Lesson> {
		return await this.lessonService.updateLesson(memberId.toString(), input);
	}

	@Roles(MemberType.TRAINER)
	@UseGuards(RolesGuard)
	@Mutation(() => Lesson)
	public async deleteLesson(
		@Args('lessonId') lessonId: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Lesson> {
		return await this.lessonService.deleteLesson(memberId.toString(), lessonId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => LessonProgress)
	public async completeLesson(
		@Args('lessonId') lessonId: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<LessonProgress> {
		return await this.lessonService.completeLesson(memberId.toString(), lessonId);
	}

	@UseGuards(AuthGuard)
	@Query(() => [LessonProgress])
	public async getLessonProgress(
		@Args('courseId') courseId: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<LessonProgress[]> {
		return await this.lessonService.getLessonProgress(memberId.toString(), courseId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => String)
	public async videoUploader(
		@Args({ name: 'file', type: () => GraphQLUpload }) { createReadStream, filename, mimetype }: FileUpload,
	): Promise<string> {
		if (!filename) throw new Error(Message.UPLOAD_FAILED);
		if (!validVideoMimes.includes(mimetype)) throw new Error('Please provide a valid video file (mp4, webm, ogg)');
		const ext = filename.split('.').pop();
		const videoName = getSerialForImage(filename).replace(/\.[^.]+$/, '') + '.' + ext;
		const dir = 'uploads/video';
		await mkdir(dir, { recursive: true });
		const url = `${dir}/${videoName}`;
		const ok = await new Promise((resolve, reject) => {
			createReadStream().pipe(createWriteStream(url)).on('finish', () => resolve(true)).on('error', () => reject(false));
		});
		if (!ok) throw new Error(Message.UPLOAD_FAILED);
		return url;
	}

	/** ADMIN **/
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => [Lesson])
	public async getLessonsByAdmin(@Args('courseId') courseId: string): Promise<Lesson[]> {
		return await this.lessonService.getLessonsByAdmin(courseId);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Lesson)
	public async deleteLessonByAdmin(@Args('lessonId') lessonId: string): Promise<Lesson> {
		return await this.lessonService.deleteLessonByAdmin(lessonId);
	}
}
