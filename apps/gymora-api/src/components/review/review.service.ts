import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review } from '../../libs/dto/review/review';
import { ReviewInput } from '../../libs/dto/review/review.input';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class ReviewService {
	constructor(
		@InjectModel('Review') private readonly reviewModel: Model<Review>,
		@InjectModel('Trainer') private readonly trainerModel: Model<any>,
		@InjectModel('Course') private readonly courseModel: Model<any>,
		@InjectModel('Workout') private readonly workoutModel: Model<any>,
	) {}

	public async createReview(input: ReviewInput): Promise<Review> {
		if (!input.trainerId && !input.courseId && !input.workoutId) {
			throw new BadRequestException(Message.BAD_REQUEST);
		}

		const mId = new Types.ObjectId(input.memberId);

		// === PERMISSION CHECKS ===

		// Trainer review: faqat shu trainer'ning birorta kursini sotib olgan user
		if (input.trainerId) {
			const trainer = await this.trainerModel.findById(input.trainerId).exec();
			if (!trainer) throw new BadRequestException('Trainer not found');
			const hasPurchased = await this.courseModel.findOne({
				trainerId: trainer._id,
				purchasedMembers: mId,
			}).exec();
			if (!hasPurchased) {
				throw new BadRequestException(
					'You can only review a trainer after purchasing one of their courses.',
				);
			}
		}

		// Course review: faqat o'sha kursni sotib olgan user
		if (input.courseId) {
			const course = await this.courseModel.findOne({
				_id: input.courseId,
				purchasedMembers: mId,
			}).exec();
			if (!course) {
				throw new BadRequestException(
					'You can only review a course after enrolling in it.',
				);
			}
		}

		// Workout review — hamma review qo'ya oladi (bepul content)

		const filter: any = { memberId: input.memberId };
		if (input.trainerId) filter.trainerId = input.trainerId;
		if (input.courseId) filter.courseId = input.courseId;
		if (input.workoutId) filter.workoutId = input.workoutId;

		const existing = await this.reviewModel.findOne(filter).exec();
		if (existing) throw new BadRequestException('You have already reviewed this item');

		const result = await this.reviewModel.create(input);

		// Rating avtomatik recalculate
		if (input.trainerId) await this.recalculateRating('trainer', input.trainerId.toString());
		if (input.courseId) await this.recalculateRating('course', input.courseId.toString());
		if (input.workoutId) await this.recalculateRating('workout', input.workoutId.toString());

		return result;
	}

	/** Trainer / Course / Workout ratingini haqiqiy reviewlardan hisoblaydi */
	private async recalculateRating(type: 'trainer' | 'course' | 'workout', id: string): Promise<void> {
		const objId = new Types.ObjectId(id);
		const matchField = type === 'trainer' ? 'trainerId' : type === 'course' ? 'courseId' : 'workoutId';

		const agg = await this.reviewModel.aggregate([
			{ $match: { [matchField]: objId } },
			{ $group: { _id: null, avg: { $avg: '$reviewRating' }, count: { $sum: 1 } } },
		]);

		const avg = parseFloat((agg[0]?.avg ?? 0).toFixed(1));
		const count = agg[0]?.count ?? 0;

		if (type === 'trainer') {
			await this.trainerModel.findByIdAndUpdate(id, { trainerRating: avg, trainerRatingCount: count }).exec();
		} else if (type === 'course') {
			await this.courseModel.findByIdAndUpdate(id, { courseRating: avg, courseRatingCount: count }).exec();
		} else {
			await this.workoutModel.findByIdAndUpdate(id, { workoutRating: avg, workoutRatingCount: count }).exec();
		}
	}

	public async getTrainerReviews(trainerId: string): Promise<Review[]> {
		return await this.reviewModel
			.aggregate([
				{ $match: { trainerId: new Types.ObjectId(trainerId) } },
				{ $sort: { createdAt: -1 } },
				{
					$lookup: { from: 'members', localField: 'memberId', foreignField: '_id', as: 'memberArr' },
				},
				{
					$addFields: {
						memberData: {
							$cond: {
								if: { $gt: [{ $size: '$memberArr' }, 0] },
								then: { _id: { $arrayElemAt: ['$memberArr._id', 0] }, memberNick: { $arrayElemAt: ['$memberArr.memberNick', 0] }, memberImage: { $arrayElemAt: ['$memberArr.memberImage', 0] } },
								else: null,
							},
						},
					},
				},
				{ $project: { memberArr: 0 } },
			])
			.exec();
	}

	public async getCourseReviews(courseId: string): Promise<Review[]> {
		return await this.reviewModel
			.aggregate([
				{ $match: { courseId: new Types.ObjectId(courseId) } },
				{ $sort: { createdAt: -1 } },
				{
					$lookup: { from: 'members', localField: 'memberId', foreignField: '_id', as: 'memberArr' },
				},
				{
					$addFields: {
						memberData: {
							$cond: {
								if: { $gt: [{ $size: '$memberArr' }, 0] },
								then: { _id: { $arrayElemAt: ['$memberArr._id', 0] }, memberNick: { $arrayElemAt: ['$memberArr.memberNick', 0] }, memberImage: { $arrayElemAt: ['$memberArr.memberImage', 0] } },
								else: null,
							},
						},
					},
				},
				{ $project: { memberArr: 0 } },
			])
			.exec();
	}

	public async getWorkoutReviews(workoutId: string): Promise<Review[]> {
		return await this.reviewModel
			.aggregate([
				{ $match: { workoutId: new Types.ObjectId(workoutId) } },
				{ $sort: { createdAt: -1 } },
				{
					$lookup: { from: 'members', localField: 'memberId', foreignField: '_id', as: 'memberArr' },
				},
				{
					$addFields: {
						memberData: {
							$cond: {
								if: { $gt: [{ $size: '$memberArr' }, 0] },
								then: { _id: { $arrayElemAt: ['$memberArr._id', 0] }, memberNick: { $arrayElemAt: ['$memberArr.memberNick', 0] }, memberImage: { $arrayElemAt: ['$memberArr.memberImage', 0] } },
								else: null,
							},
						},
					},
				},
				{ $project: { memberArr: 0 } },
			])
			.exec();
	}
}
