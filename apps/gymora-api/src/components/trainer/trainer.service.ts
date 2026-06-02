import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Message } from '../../libs/enums/common.enum';
import { Direction } from '../../libs/enums/common.enum';
import { Member } from '../../libs/dto/member/member';
import { MemberType } from '../../libs/enums/member.enum';
import { Trainer, Trainers } from '../../libs/dto/trainer/trainer';
import { TrainerInput, TrainerUpdate, TrainersListInquiry } from '../../libs/dto/trainer/trainer.input';
import { ViewService } from '../view/view.service';
import { LikeService } from '../like/like.service';
import { ViewGroup } from '../../libs/enums/view.enum';
import { LikeGroup } from '../../libs/enums/like.enum';

@Injectable()
export class TrainerService {
	constructor(
		@InjectModel('Trainer') private readonly trainerModel: Model<Trainer>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		private readonly viewService: ViewService,
		private readonly likeService: LikeService,
	) {}

	public async createTrainer(input: TrainerInput): Promise<Trainer> {
		const existing = await this.trainerModel.findOne({ memberId: input.memberId }).exec();
		if (existing) throw new InternalServerErrorException('Trainer profile already exists for this member');

		const result = await this.trainerModel.create(input);
		await this.memberModel.findByIdAndUpdate(input.memberId, { memberType: MemberType.TRAINER }).exec();
		return result;
	}

	public async getTrainer(memberId: ObjectId | null, trainerId: string): Promise<Trainer> {
		const result = await this.trainerModel.findById(trainerId).lean().exec();
		if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (memberId) {
			// Record view — increment memberViews on the trainer's member account
			const viewInput = { memberId, viewRefId: result._id, viewGroup: ViewGroup.TRAINER };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.memberModel.findByIdAndUpdate(result.memberId, { $inc: { memberViews: 1 } }).exec();
			}

			const likeInput = { memberId, likeRefId: result._id, likeGroup: LikeGroup.TRAINER };
			result.meLiked = await this.likeService.checkLikeExistence(likeInput);
		}

		return result;
	}

	public async getTrainers(input: TrainersListInquiry): Promise<Trainers> {
		const { page, limit, sort, direction, search } = input;
		const match: Record<string, any> = { deletedAt: { $exists: false } };

		if (search.text) {
			match.$or = [
				{ trainerBio: { $regex: new RegExp(search.text, 'i') } },
				{ trainerSpecializations: { $elemMatch: { $regex: new RegExp(search.text, 'i') } } },
			];
		}

		const sortKey = sort ?? 'createdAt';
		const sortDir = direction ?? Direction.DESC;
		const sortStage: Record<string, 1 | -1> = { [sortKey]: sortDir as 1 | -1 };

		const result = await this.trainerModel
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

	public async getTrainerByMemberId(memberId: string): Promise<Trainer | null> {
		return await this.trainerModel.findOne({ memberId, deletedAt: { $exists: false } }).exec();
	}

	public async updateTrainer(memberId: string, input: TrainerUpdate): Promise<Trainer> {
		const result = await this.trainerModel.findOneAndUpdate({ _id: input._id, memberId }, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}
}
