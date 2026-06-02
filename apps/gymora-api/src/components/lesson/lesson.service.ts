import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lesson } from '../../libs/dto/lesson/lesson';
import { LessonProgress } from '../../libs/dto/lesson/lesson.progress';
import { Trainer } from '../../libs/dto/trainer/trainer';
import { LessonInput, LessonUpdate } from '../../libs/dto/lesson/lesson.input';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class LessonService {
	constructor(
		@InjectModel('Lesson') private readonly lessonModel: Model<Lesson>,
		@InjectModel('LessonProgress') private readonly progressModel: Model<LessonProgress>,
		@InjectModel('Trainer') private readonly trainerModel: Model<Trainer>,
		@InjectModel('Course') private readonly courseModel: Model<any>,
	) {}

	public async createLesson(memberId: string, input: LessonInput): Promise<Lesson> {
		await this.assertTrainerOwnsCourse(memberId, input.courseId);
		return await this.lessonModel.create(input);
	}

	public async getLessonsByCourse(courseId: string): Promise<Lesson[]> {
		return await this.lessonModel
			.find({ courseId, deletedAt: { $exists: false } })
			.sort({ weekNumber: 1, order: 1 })
			.exec();
	}

	public async updateLesson(memberId: string, input: LessonUpdate): Promise<Lesson> {
		const lesson = await this.lessonModel.findById(input._id).exec();
		if (!lesson) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		await this.assertTrainerOwnsCourse(memberId, lesson.courseId.toString());
		const { _id, ...updateData } = input as any;
		const result = await this.lessonModel.findByIdAndUpdate(_id, updateData, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}

	public async deleteLesson(memberId: string, lessonId: string): Promise<Lesson> {
		const lesson = await this.lessonModel.findById(lessonId).exec();
		if (!lesson) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		await this.assertTrainerOwnsCourse(memberId, lesson.courseId.toString());
		const result = await this.lessonModel
			.findByIdAndUpdate(lessonId, { deletedAt: new Date() }, { new: true })
			.exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
		return result;
	}

	public async completeLesson(memberId: string, lessonId: string): Promise<LessonProgress> {
		const lesson = await this.lessonModel.findById(lessonId).exec();
		if (!lesson) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const courseId = lesson.courseId.toString();
		const now = new Date();

		const enrolled = await this.courseModel.findOne({ _id: courseId, purchasedMembers: memberId }).exec();
		if (!enrolled) throw new UnauthorizedException(Message.NOT_ALLOWED_REQUEST);

		const progressRecord = await this.progressModel.findOne({ memberId, lessonId }).exec();
		if (!progressRecord) throw new InternalServerErrorException(Message.NOT_ALLOWED_REQUEST);
		if (!progressRecord.unlockedAt || new Date(progressRecord.unlockedAt) > now) {
			throw new BadRequestException('This lesson is not yet unlocked.');
		}

		const current = await this.progressModel
			.findOneAndUpdate({ memberId, lessonId }, { isCompleted: true, completedAt: now }, { new: true })
			.exec();
		if (!current) throw new InternalServerErrorException(Message.NOT_ALLOWED_REQUEST);

		const allLessons = await this.lessonModel
			.find({ courseId, deletedAt: { $exists: false } })
			.sort({ weekNumber: 1, order: 1 })
			.exec();

		const currentIdx = allLessons.findIndex((l) => l._id.toString() === lessonId);
		const nextLesson = allLessons[currentIdx + 1];
		if (!nextLesson) return current;

		const unlockedAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

		await this.progressModel
			.findOneAndUpdate(
				{ memberId, lessonId: nextLesson._id },
				{ memberId, courseId, lessonId: nextLesson._id, unlockedAt, isCompleted: false },
				{ upsert: true, new: true },
			)
			.exec();

		return current;
	}

	public async getLessonProgress(memberId: string, courseId: string): Promise<LessonProgress[]> {
		return await this.progressModel.find({ memberId, courseId }).exec();
	}

	public async getLessonsByAdmin(courseId: string): Promise<Lesson[]> {
		return await this.lessonModel.find({ courseId }).sort({ weekNumber: 1, order: 1 }).exec();
	}

	public async deleteLessonByAdmin(lessonId: string): Promise<Lesson> {
		const result = await this.lessonModel.findByIdAndDelete(lessonId).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
		return result;
	}

	private async assertTrainerOwnsCourse(memberId: string, courseId: string): Promise<void> {
		const trainer = await this.trainerModel.findOne({ memberId }).exec();
		if (!trainer) throw new UnauthorizedException(Message.NOT_ALLOWED_REQUEST);

		const course = await this.courseModel
			.findOne({ _id: new Types.ObjectId(courseId), trainerId: trainer._id })
			.exec();
		if (!course) throw new UnauthorizedException(Message.NOT_ALLOWED_REQUEST);
	}
}
