import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import { Workout } from '../../libs/dto/workout/workout';
import { WorkoutInput } from '../../libs/dto/workout/workout.input';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class WorkoutService {
	constructor(
		@InjectModel('Workout') private readonly workoutModel: Model<Workout>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
	) {}

	public async createWorkout(input: WorkoutInput): Promise<Workout> {
		const result = await this.workoutModel.create(input);
		await this.memberModel.findByIdAndUpdate(input.memberId, { $inc: { memberWorkouts: 1 } }).exec();
		return result;
	}

	public async getWorkout(workoutId: string): Promise<Workout> {
		const result = await this.workoutModel.findById(workoutId).exec();
		if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result;
	}

	public async getMemberWorkouts(memberId: string): Promise<Workout[]> {
		return await this.workoutModel.find({ memberId }).sort({ createdAt: -1 }).exec();
	}
}
