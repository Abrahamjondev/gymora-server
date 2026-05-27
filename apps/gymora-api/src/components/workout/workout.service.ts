import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import { Workout } from '../../libs/dto/workout/workout';
import { WorkoutInput } from '../../libs/dto/workout/workout.input';
import { Message } from '../../libs/enums/common.enum';
import { ViewService } from '../view/view.service';
import { LikeService } from '../like/like.service';
import { ViewGroup } from '../../libs/enums/view.enum';
import { LikeGroup } from '../../libs/enums/like.enum';

@Injectable()
export class WorkoutService {
	constructor(
		@InjectModel('Workout') private readonly workoutModel: Model<Workout>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		private readonly viewService: ViewService,
		private readonly likeService: LikeService,
	) {}

	public async createWorkout(input: WorkoutInput): Promise<Workout> {
		const result = await this.workoutModel.create(input);
		await this.memberModel.findByIdAndUpdate(input.memberId, { $inc: { memberWorkouts: 1 } }).exec();
		return result;
	}

	public async getWorkout(memberId: ObjectId | null, workoutId: string): Promise<Workout> {
		const result = await this.workoutModel.findById(workoutId).lean().exec();
		if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (memberId) {
			const viewInput = { memberId, viewRefId: result._id, viewGroup: ViewGroup.WORKOUT };
			await this.viewService.recordView(viewInput);
			const likeInput = { memberId, likeRefId: result._id, likeGroup: LikeGroup.WORKOUT };
			result.meLiked = await this.likeService.checkLikeExistence(likeInput);
		}

		return result;
	}

	public async getWorkouts(): Promise<Workout[]> {
		return await this.workoutModel.find().sort({ createdAt: -1 }).exec();
	}

	public async getMemberWorkouts(memberId: string): Promise<Workout[]> {
		return await this.workoutModel.find({ memberId }).sort({ createdAt: -1 }).exec();
	}
}
