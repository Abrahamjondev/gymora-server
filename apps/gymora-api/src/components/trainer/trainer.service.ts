import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../../libs/enums/common.enum';
import { Member } from '../../libs/dto/member/member';
import { MemberType } from '../../libs/enums/member.enum';
import { Trainer } from '../../libs/dto/trainer/trainer';
import { TrainerInput, TrainerUpdate } from '../../libs/dto/trainer/trainer.input';

@Injectable()
export class TrainerService {
	constructor(
		@InjectModel('Trainer') private readonly trainerModel: Model<Trainer>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
	) {}

	public async createTrainer(input: TrainerInput): Promise<Trainer> {
		const result = await this.trainerModel.create(input);
		await this.memberModel.findByIdAndUpdate(input.memberId, { memberType: MemberType.TRAINER }).exec();
		return result;
	}

	public async getTrainer(trainerId: string): Promise<Trainer> {
		const result = await this.trainerModel.findById(trainerId).exec();
		if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result;
	}

	public async getTrainers(): Promise<Trainer[]> {
		return await this.trainerModel.find().sort({ createdAt: -1 }).exec();
	}

	public async updateTrainer(memberId: string, input: TrainerUpdate): Promise<Trainer> {
		const result = await this.trainerModel.findOneAndUpdate({ _id: input._id, memberId }, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}
}
