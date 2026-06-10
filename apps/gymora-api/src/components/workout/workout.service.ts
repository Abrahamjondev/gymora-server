import { Injectable, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, ObjectId } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import { Workout, Workouts } from '../../libs/dto/workout/workout';
import { WorkoutInput, WorkoutUpdate, WorkoutsInquiry } from '../../libs/dto/workout/workout.input';
import { Message, Direction } from '../../libs/enums/common.enum';
import { ViewService } from '../view/view.service';
import { LikeService } from '../like/like.service';
import { ViewGroup } from '../../libs/enums/view.enum';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeInput } from '../../libs/dto/like/like.input';

@Injectable()
export class WorkoutService {
	private readonly freeWorkoutLimit: number;

	constructor(
		@InjectModel('Workout') private readonly workoutModel: Model<Workout>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		private readonly viewService: ViewService,
		private readonly likeService: LikeService,
		private readonly configService: ConfigService,
	) {
		this.freeWorkoutLimit = parseInt(this.configService.get<string>('FREE_WORKOUT_LIMIT') ?? '2', 10);
	}

	public async createWorkout(input: WorkoutInput): Promise<Workout> {
		// If isFree not specified, default to true only if under limit
		const isFreeRequested = input.isFree !== false; // undefined → true (free by default)

		if (isFreeRequested && input.memberId) {
			const freeCount = await this.workoutModel.countDocuments({
				memberId: input.memberId,
				isFree: true,
				deletedAt: { $exists: false },
			});
			if (freeCount >= this.freeWorkoutLimit) {
				throw new ForbiddenException(
					`You can only have ${this.freeWorkoutLimit} free preview workouts. Link additional workouts to a course.`,
				);
			}
		}

		const workoutData = {
			...input,
			isFree: isFreeRequested,
			courseId: input.courseId || null,
		};

		const result = await this.workoutModel.create(workoutData);
		await this.memberModel.findByIdAndUpdate(input.memberId, { $inc: { memberWorkouts: 1 } }).exec();
		return result;
	}

	public async getWorkout(memberId: ObjectId | null, workoutId: string): Promise<Workout> {
		const result = await this.workoutModel.findById(workoutId).lean().exec();
		if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		// Access control: if workout is not free, check course enrollment
		if (!result.isFree && result.courseId && memberId) {
			const member = await this.memberModel.findById(memberId).exec();
			if (!member) throw new ForbiddenException('Please log in to access this workout.');

			// Check if member is enrolled in the course OR is the creator (trainer)
			const isCreator = result.memberId.toString() === memberId.toString();
			if (!isCreator) {
				const { Course } = require('mongoose').models;
				// Use raw db query to check enrollment
				const workoutWithCourse = result as any;
				const courseDoc = await this.workoutModel.db
					.collection('courses')
					.findOne({ _id: workoutWithCourse.courseId, purchasedMembers: memberId });

				if (!courseDoc) {
					// Return workout with exercises hidden (teaser only)
					return {
						...result,
						exercises: [],
						workoutDesc: result.workoutDesc ? result.workoutDesc.slice(0, 120) + '…' : undefined,
					} as unknown as Workout;
				}
			}
		}

		if (memberId) {
			const viewInput = { memberId, viewRefId: result._id, viewGroup: ViewGroup.WORKOUT };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.workoutModel.findByIdAndUpdate(workoutId, { $inc: { workoutViews: 1 } }).exec();
				result.workoutViews = (result.workoutViews ?? 0) + 1;
			}
			const likeInput = { memberId, likeRefId: result._id, likeGroup: LikeGroup.WORKOUT };
			result.meLiked = await this.likeService.checkLikeExistence(likeInput);
		}

		return result;
	}

	public async likeWorkout(memberId: ObjectId, workoutId: string): Promise<Workout> {
		const workout = await this.workoutModel.findById(workoutId).exec();
		if (!workout) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const likeInput: LikeInput = { memberId, likeRefId: workout._id, likeGroup: LikeGroup.WORKOUT };
		const modifier = await this.likeService.toggleLike(likeInput);
		const updated = await this.workoutModel
			.findByIdAndUpdate(workoutId, { $inc: { workoutLikes: modifier } }, { new: true })
			.lean()
			.exec();

		if (!updated) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return updated;
	}

	public async getWorkouts(input: WorkoutsInquiry, memberId?: ObjectId): Promise<Workouts> {
		const { page, limit, sort, direction, search } = input;
		const match: Record<string, any> = { deletedAt: { $exists: false } };

		if (search.workoutDifficulty) match.workoutDifficulty = search.workoutDifficulty;
		if (search.targetMuscle) match.targetMuscle = { $regex: new RegExp(search.targetMuscle, 'i') };
		if (search.text) {
			match.$or = [
				{ workoutTitle: { $regex: new RegExp(search.text, 'i') } },
				{ workoutDesc: { $regex: new RegExp(search.text, 'i') } },
			];
		}
		// Public listing only shows free workouts
		if (search.isFree !== undefined) {
			match.isFree = search.isFree;
		} else {
			match.isFree = true; // default: only free workouts in public listing
		}

		const sortKey = sort ?? 'createdAt';
		const sortDir = direction ?? Direction.DESC;

		const result = await this.workoutModel
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

		// Attach meLiked for authenticated user
		if (memberId && result[0].list?.length) {
			for (const workout of result[0].list) {
				const likeInput = { memberId, likeRefId: workout._id, likeGroup: LikeGroup.WORKOUT };
				workout.meLiked = await this.likeService.checkLikeExistence(likeInput);
			}
		}

		return result[0];
	}

	public async updateWorkout(memberId: string, input: WorkoutUpdate): Promise<Workout> {
		const workout = await this.workoutModel.findOne({ _id: input._id, memberId }).exec();
		if (!workout) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		const { _id, ...updateData } = input;
		const result = await this.workoutModel.findByIdAndUpdate(_id, updateData, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}

	public async getMemberWorkouts(memberId: string): Promise<Workout[]> {
		return await this.workoutModel
			.find({ memberId, deletedAt: { $exists: false } })
			.sort({ createdAt: -1 })
			.exec();
	}

	public async getWorkoutsByMemberId(memberId: string): Promise<Workout[]> {
		return await this.workoutModel
			.find({ memberId, deletedAt: { $exists: false } })
			.sort({ createdAt: -1 })
			.exec();
	}

	// Get trainer's free workout count (to show remaining slots)
	public async getFreeWorkoutCount(memberId: string): Promise<number> {
		return await this.workoutModel.countDocuments({
			memberId,
			isFree: true,
			deletedAt: { $exists: false },
		});
	}

	/** ADMIN **/

	public async getAllWorkoutsByAdmin(input: WorkoutsInquiry): Promise<Workouts> {
		const { page, limit, sort, direction, search } = input;
		const match: Record<string, any> = {};

		if (search.workoutDifficulty) match.workoutDifficulty = search.workoutDifficulty;
		if (search.targetMuscle) match.targetMuscle = { $regex: new RegExp(search.targetMuscle, 'i') };
		if (search.text) {
			match.$or = [
				{ workoutTitle: { $regex: new RegExp(search.text, 'i') } },
				{ workoutDesc: { $regex: new RegExp(search.text, 'i') } },
			];
		}
		if (search.isFree !== undefined) match.isFree = search.isFree;

		const sortKey = sort ?? 'createdAt';
		const sortDir = direction ?? Direction.DESC;

		const result = await this.workoutModel
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

	public async updateWorkoutByAdmin(input: WorkoutUpdate): Promise<Workout> {
		const result = await this.workoutModel.findByIdAndUpdate(input._id, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}

	public async deleteWorkoutByAdmin(workoutId: string): Promise<Workout> {
		const result = await this.workoutModel.findByIdAndDelete(workoutId).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
		return result;
	}
}
