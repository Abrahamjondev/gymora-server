import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { Course, Courses } from '../../libs/dto/course/course';
import { Member } from '../../libs/dto/member/member';
import { Trainer } from '../../libs/dto/trainer/trainer';
import { Lesson } from '../../libs/dto/lesson/lesson';
import { LessonProgress } from '../../libs/dto/lesson/lesson.progress';
import { CourseInput, CourseUpdate, CoursesInquiry } from '../../libs/dto/course/course.input';
import { Message } from '../../libs/enums/common.enum';
import { Direction } from '../../libs/enums/common.enum';

@Injectable()
export class CourseService {
	constructor(
		@InjectModel('Course') private readonly courseModel: Model<Course>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		@InjectModel('Trainer') private readonly trainerModel: Model<Trainer>,
		@InjectModel('Lesson') private readonly lessonModel: Model<Lesson>,
		@InjectModel('LessonProgress') private readonly progressModel: Model<LessonProgress>,
		private readonly configService: ConfigService,
	) {}

	public async createCourse(memberId: string, input: CourseInput): Promise<Course> {
		const trainer = await this.trainerModel.findOne({ memberId }).exec();
		if (!trainer) throw new UnauthorizedException(Message.NOT_ALLOWED_REQUEST);
		const result = await this.courseModel.create({ ...input, trainerId: trainer._id });
		await this.memberModel.findByIdAndUpdate(memberId, { $inc: { memberCourses: 1 } }).exec();
		return result;
	}

	public async getCourse(courseId: string): Promise<Course> {
		const course = await this.courseModel.findById(courseId).exec();
		if (!course) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		const lessons = await this.lessonModel
			.find({ courseId, deletedAt: { $exists: false } })
			.sort({ weekNumber: 1, order: 1 })
			.exec();
		const result = course.toObject() as Course;
		result.lessons = lessons;
		return result;
	}

	public async getCourses(input: CoursesInquiry): Promise<Courses> {
		const { page, limit, sort, direction, search } = input;
		const match: Record<string, any> = { deletedAt: { $exists: false } };

		if (search.courseCategory) match.courseCategory = search.courseCategory;
		if (search.courseDifficulty) match.courseDifficulty = search.courseDifficulty;
		if (search.text) {
			match.$or = [
				{ courseTitle: { $regex: new RegExp(search.text, 'i') } },
				{ courseDesc: { $regex: new RegExp(search.text, 'i') } },
			];
		}

		const sortKey = sort ?? 'createdAt';
		const sortDir = direction ?? Direction.DESC;
		const sortStage: Record<string, 1 | -1> = { [sortKey]: sortDir as 1 | -1 };

		const result = await this.courseModel
			.aggregate([
				{ $match: match },
				{ $sort: sortStage },
				{
					$facet: {
						list: [{ $skip: (page - 1) * limit }, { $limit: limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0];
	}

	/** Member sotib olgan kurslarni qaytaradi */
	public async getMemberPurchasedCourses(memberId: string): Promise<Course[]> {
		return await this.courseModel
			.find({ purchasedMembers: memberId, deletedAt: { $exists: false } })
			.sort({ createdAt: -1 })
			.exec();
	}

	public async getTrainerCourses(memberId: string): Promise<Course[]> {
		const trainer = await this.trainerModel.findOne({ memberId }).exec();
		if (!trainer) return [];
		return await this.courseModel.find({ trainerId: trainer._id }).sort({ createdAt: -1 }).exec();
	}

	// Public: get courses by trainer._id (for viewing trainer profile)
	public async getCoursesByTrainerId(trainerId: string): Promise<Course[]> {
		return await this.courseModel
			.find({ trainerId, deletedAt: { $exists: false } })
			.sort({ createdAt: -1 })
			.exec();
	}

	public async updateCourse(memberId: string, input: CourseUpdate): Promise<Course> {
		const course = await this.courseModel.findById(input._id).exec();
		if (!course) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		await this.assertTrainerOwner(memberId, course.trainerId.toString());
		const result = await this.courseModel.findByIdAndUpdate(input._id, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}

	/** Stripe Checkout Session yaratadi — pullik kurslar uchun */
	public async createCheckoutSession(courseId: string, memberId: string, baseUrl: string): Promise<string> {
		const course = await this.courseModel.findById(courseId).exec();
		if (!course) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		if ((course.coursePrice ?? 0) <= 0) throw new BadRequestException('This course is free — use purchaseCourse instead.');

		const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
		if (!stripeKey || stripeKey.includes('your_')) throw new BadRequestException('Stripe is not configured.');

		const Stripe = (await import('stripe')).default;
		const stripe = new Stripe(stripeKey);

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			mode: 'payment',
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: { name: course.courseTitle },
						unit_amount: Math.round((course.coursePrice ?? 0) * 100),
					},
					quantity: 1,
				},
			],
			metadata: { courseId, memberId },
			success_url: `${baseUrl}/course/detail?courseId=${courseId}&session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${baseUrl}/course/detail?courseId=${courseId}`,
		});

		return session.url ?? '';
	}

	/** Stripe to'lovi tasdiqlangach enrollment ni amalga oshiradi */
	public async confirmCoursePayment(sessionId: string, courseId: string, memberId: string): Promise<Course> {
		const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
		if (!stripeKey || stripeKey.includes('your_')) throw new BadRequestException('Stripe is not configured.');

		const Stripe = (await import('stripe')).default;
		const stripe = new Stripe(stripeKey);

		const session = await stripe.checkout.sessions.retrieve(sessionId);
		if (session.payment_status !== 'paid') throw new BadRequestException('Payment not completed.');

		// Verify metadata matches
		if (session.metadata?.courseId !== courseId || session.metadata?.memberId !== memberId) {
			throw new BadRequestException('Payment session mismatch.');
		}

		// Enroll the member
		return await this.enrollMember(courseId, memberId);
	}

	/** Bepul kurs yoki payment tasdiqlangandan keyin enrollment */
	private async enrollMember(courseId: string, memberId: string): Promise<Course> {
		const result = await this.courseModel
			.findOneAndUpdate(
				{ _id: courseId, purchasedMembers: { $ne: memberId } },
				{ $addToSet: { purchasedMembers: memberId } },
				{ new: true },
			)
			.exec();

		if (result) {
			await this.memberModel.findByIdAndUpdate(memberId, { $inc: { memberCourses: 1 } }).exec();
			await this.unlockFirstLesson(courseId, memberId);
			return result;
		}
		const existing = await this.courseModel.findById(courseId).exec();
		if (!existing) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return existing;
	}

	public async purchaseCourse(courseId: string, memberId: string): Promise<Course> {
		const course = await this.courseModel.findById(courseId).exec();
		if (!course) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		// Bepul kurslar uchun to'g'ridan enrollment
		if ((course.coursePrice ?? 0) > 0) {
			throw new BadRequestException('This course requires payment. Use createCheckoutSession instead.');
		}

		return await this.enrollMember(courseId, memberId);
	}

	private async unlockFirstLesson(courseId: string, memberId: string): Promise<void> {
		const firstLesson = await this.lessonModel
			.findOne({ courseId, deletedAt: { $exists: false } })
			.sort({ weekNumber: 1, order: 1 })
			.exec();
		if (!firstLesson) return;

		await this.progressModel.findOneAndUpdate(
			{ memberId, lessonId: firstLesson._id },
			{ memberId, courseId, lessonId: firstLesson._id, unlockedAt: new Date(), isCompleted: false },
			{ upsert: true, new: true },
		).exec();
	}

	private async assertTrainerOwner(memberId: string, trainerId: string): Promise<void> {
		const trainer = await this.trainerModel.findOne({ _id: trainerId, memberId }).exec();
		if (!trainer) throw new UnauthorizedException(Message.NOT_ALLOWED_REQUEST);
	}

	/** ADMIN **/

	public async getAllCoursesByAdmin(input: CoursesInquiry): Promise<Courses> {
		const { page, limit, sort, direction, search } = input;
		const match: Record<string, any> = {};

		if (search.courseCategory) match.courseCategory = search.courseCategory;
		if (search.courseDifficulty) match.courseDifficulty = search.courseDifficulty;
		if (search.text) {
			match.$or = [
				{ courseTitle: { $regex: new RegExp(search.text, 'i') } },
				{ courseDesc: { $regex: new RegExp(search.text, 'i') } },
			];
		}

		const sortKey = sort ?? 'createdAt';
		const sortDir = direction ?? Direction.DESC;

		const result = await this.courseModel
			.aggregate([
				{ $match: match },
				{ $sort: { [sortKey]: sortDir as 1 | -1 } },
				{
					$facet: {
						list: [{ $skip: (page - 1) * limit }, { $limit: limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0];
	}

	public async updateCourseByAdmin(input: CourseUpdate): Promise<Course> {
		const result = await this.courseModel.findByIdAndUpdate(input._id, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}

	public async deleteCourseByAdmin(courseId: string): Promise<Course> {
		const result = await this.courseModel.findByIdAndDelete(courseId).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
		return result;
	}
}
