import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from '../../libs/dto/course/course';
import { Member } from '../../libs/dto/member/member';
import { Trainer } from '../../libs/dto/trainer/trainer';
import { CourseInput, CourseUpdate } from '../../libs/dto/course/course.input';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class CourseService {
	constructor(
		@InjectModel('Course') private readonly courseModel: Model<Course>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		@InjectModel('Trainer') private readonly trainerModel: Model<Trainer>,
	) {}

	public async createCourse(memberId: string, input: CourseInput): Promise<Course> {
		await this.assertTrainerOwner(memberId, input.trainerId);
		const result = await this.courseModel.create(input);
		await this.memberModel.findByIdAndUpdate(memberId, { $inc: { memberCourses: 1 } }).exec();
		return result;
	}

	public async getCourse(courseId: string): Promise<Course> {
		const result = await this.courseModel.findById(courseId).exec();
		if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result;
	}

	public async getCourses(): Promise<Course[]> {
		return await this.courseModel.find().sort({ createdAt: -1 }).exec();
	}

	public async updateCourse(memberId: string, input: CourseUpdate): Promise<Course> {
		const course = await this.courseModel.findById(input._id).exec();
		if (!course) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		await this.assertTrainerOwner(memberId, course.trainerId.toString());
		const result = await this.courseModel.findByIdAndUpdate(input._id, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}

	public async purchaseCourse(courseId: string, memberId: string): Promise<Course> {
		const result = await this.courseModel
			.findOneAndUpdate({ _id: courseId, purchasedMembers: { $ne: memberId } }, { $addToSet: { purchasedMembers: memberId } }, { new: true })
			.exec();
		if (result) {
			await this.memberModel.findByIdAndUpdate(memberId, { $inc: { memberCourses: 1 } }).exec();
			return result;
		}
		const existing = await this.courseModel.findById(courseId).exec();
		if (!existing) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return existing;
	}

	private async assertTrainerOwner(memberId: string, trainerId: string): Promise<void> {
		const trainer = await this.trainerModel.findOne({ _id: trainerId, memberId }).exec();
		if (!trainer) throw new UnauthorizedException(Message.NOT_ALLOWED_REQUEST);
	}
}
