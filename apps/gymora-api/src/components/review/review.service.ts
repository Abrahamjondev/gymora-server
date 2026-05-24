import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review } from '../../libs/dto/review/review';
import { ReviewInput } from '../../libs/dto/review/review.input';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class ReviewService {
	constructor(@InjectModel('Review') private readonly reviewModel: Model<Review>) {}

	public async createReview(input: ReviewInput): Promise<Review> {
		if (!input.trainerId && !input.courseId) throw new BadRequestException(Message.BAD_REQUEST);
		return await this.reviewModel.create(input);
	}

	public async getTrainerReviews(trainerId: string): Promise<Review[]> {
		return await this.reviewModel.find({ trainerId }).sort({ createdAt: -1 }).exec();
	}
}
