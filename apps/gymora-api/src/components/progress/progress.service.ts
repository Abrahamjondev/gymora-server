import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Progress } from '../../libs/dto/progress/progress';
import { ProgressInput } from '../../libs/dto/progress/progress.input';

@Injectable()
export class ProgressService {
	constructor(@InjectModel('Progress') private readonly progressModel: Model<Progress>) {}

	public async addProgress(input: ProgressInput): Promise<Progress> {
		return await this.progressModel.create(input);
	}

	public async getProgressTimeline(memberId: string): Promise<Progress[]> {
		return await this.progressModel.find({ memberId }).sort({ progressDate: -1 }).exec();
	}
}
