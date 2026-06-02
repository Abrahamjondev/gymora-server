import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Recommendation } from '../../libs/dto/recommendation/recommendation';
import { RecommendationInput } from '../../libs/dto/recommendation/recommendation.input';
import { RecommendationTarget } from '../../libs/enums/gymora.enum';

const TRAINER_LIMIT = 3;
const WORKOUT_LIMIT = 5;
const COURSE_LIMIT = 4;

interface GoalConfig {
	trainerSpecs: string[];
	workoutQuery: Record<string, any>;
	workoutSort: Record<string, 1 | -1>;
	courseCategories: string[];
	reasons: { trainer: string; workout: string; course: string };
}

const BASE_WORKOUT: Record<string, any> = { isFree: true, deletedAt: { $exists: false } };
const BASE_TRAINER: Record<string, any> = { trainerVerificationStatus: 'VERIFIED' };
const BASE_COURSE: Record<string, any>  = { deletedAt: { $exists: false } };

const GOAL_MAP: Record<string, GoalConfig> = {
	'Lose Weight': {
		trainerSpecs: ['Cardio', 'HIIT', 'Nutrition'],
		workoutQuery: {
			...BASE_WORKOUT,
			$or: [
				{ estimatedCaloriesBurned: { $gte: 300 } },
				{ targetMuscle: { $in: [/Full Body/i, /Core/i, /Legs/i] } },
			],
		},
		workoutSort: { estimatedCaloriesBurned: -1, workoutRating: -1 },
		courseCategories: ['CARDIO', 'NUTRITION'],
		reasons: {
			trainer: 'Cardio and nutrition coaches matched to your weight loss goal',
			workout: 'High-calorie-burn workouts to accelerate fat loss',
			course: 'Cardio and nutrition courses to support your weight loss journey',
		},
	},
	'Build Muscle': {
		trainerSpecs: ['Strength', 'Powerlifting', 'Bodybuilding', 'Hypertrophy'],
		workoutQuery: {
			...BASE_WORKOUT,
			targetMuscle: { $in: [/Chest/i, /Back/i, /Legs/i, /Arms/i, /Shoulders/i, /Glutes/i] },
			workoutDifficulty: { $in: ['INTERMEDIATE', 'ADVANCED'] },
		},
		workoutSort: { workoutRating: -1, workoutLikes: -1 },
		courseCategories: ['STRENGTH'],
		reasons: {
			trainer: 'Strength and powerlifting coaches matched to your muscle building goal',
			workout: 'Resistance training workouts targeting major muscle groups',
			course: 'Strength training courses to build muscle systematically',
		},
	},
	'Improve Cardio': {
		trainerSpecs: ['Cardio', 'HIIT'],
		workoutQuery: {
			...BASE_WORKOUT,
			estimatedCaloriesBurned: { $gte: 200 },
			targetMuscle: { $in: [/Full Body/i, /Legs/i, /Core/i] },
		},
		workoutSort: { estimatedCaloriesBurned: -1, workoutViews: -1 },
		courseCategories: ['CARDIO'],
		reasons: {
			trainer: 'Cardio and HIIT coaches matched to your endurance goal',
			workout: 'Cardio-intensive workouts to boost your endurance',
			course: 'Cardio courses to build cardiovascular fitness',
		},
	},
	'Stay Flexible': {
		trainerSpecs: ['Yoga', 'Mobility'],
		workoutQuery: {
			...BASE_WORKOUT,
			targetMuscle: { $in: [/Mobility/i, /Yoga/i, /Stretching/i, /Core/i] },
		},
		workoutSort: { workoutRating: -1, workoutViews: -1 },
		courseCategories: ['YOGA', 'MOBILITY'],
		reasons: {
			trainer: 'Yoga and mobility coaches matched to your flexibility goal',
			workout: 'Mobility and flexibility workouts for joint health',
			course: 'Yoga and mobility courses for lasting flexibility',
		},
	},
};

@Injectable()
export class RecommendationService {
	constructor(
		@InjectModel('Workout') private readonly workoutModel: Model<any>,
		@InjectModel('Trainer') private readonly trainerModel: Model<any>,
		@InjectModel('Course') private readonly courseModel: Model<any>,
		@InjectModel('Member') private readonly memberModel: Model<any>,
	) {}

	public async recommend(input: RecommendationInput): Promise<Recommendation[]> {
		const goal = input.goals?.[0] ?? '';
		const config = GOAL_MAP[goal] ?? null;
		const results: Recommendation[] = [];

		// ── Trainers ──────────────────────────────────────────────────────────
		let trainers: any[] = [];

		if (config && config.trainerSpecs.length > 0) {
			const specFilter = {
				$or: config.trainerSpecs.map((s) => ({ trainerSpecializations: new RegExp(s, 'i') })),
			};
			trainers = await this.trainerModel
				.find({ ...BASE_TRAINER, ...specFilter })
				.sort({ trainerRating: -1, trainerExperience: -1 })
				.limit(TRAINER_LIMIT)
				.populate('memberId', 'memberNick memberFullName')
				.lean()
				.exec();
		}

		// Fallback: top verified trainers not already included
		if (trainers.length < TRAINER_LIMIT) {
			const fallback = await this.trainerModel
				.find({ ...BASE_TRAINER, _id: { $nin: trainers.map((t: any) => t._id) } })
				.sort({ trainerRating: -1, trainerExperience: -1 })
				.limit(TRAINER_LIMIT - trainers.length)
				.populate('memberId', 'memberNick memberFullName')
				.lean()
				.exec();
			trainers = [...trainers, ...fallback];
		}

		if (trainers.length > 0) {
			results.push({
				target: RecommendationTarget.TRAINER,
				items: trainers.map((t: any) => {
					const m = t.memberId as any;
					return m?.memberFullName || m?.memberNick || 'Trainer';
				}),
				reason: config?.reasons.trainer ?? 'Top rated trainers on Gymora',
			});
		}

		// ── Workouts ──────────────────────────────────────────────────────────
		let workouts: any[] = [];

		if (config) {
			workouts = await this.workoutModel
				.find(config.workoutQuery)
				.sort(config.workoutSort)
				.limit(WORKOUT_LIMIT)
				.lean()
				.exec();
		}

		// Fallback: top free workouts not already included
		if (workouts.length < WORKOUT_LIMIT) {
			const fallback = await this.workoutModel
				.find({ ...BASE_WORKOUT, _id: { $nin: workouts.map((w: any) => w._id) } })
				.sort({ workoutRating: -1, workoutViews: -1 })
				.limit(WORKOUT_LIMIT - workouts.length)
				.lean()
				.exec();
			workouts = [...workouts, ...fallback];
		}

		if (workouts.length > 0) {
			results.push({
				target: RecommendationTarget.WORKOUT,
				items: workouts.map((w: any) => w.workoutTitle),
				reason: config?.reasons.workout ?? 'Most popular free workouts',
			});
		}

		// ── Courses ───────────────────────────────────────────────────────────
		let courses: any[] = [];

		if (config && config.courseCategories.length > 0) {
			courses = await this.courseModel
				.find({ ...BASE_COURSE, courseCategory: { $in: config.courseCategories } })
				.sort({ courseRating: -1, courseRank: -1 })
				.limit(COURSE_LIMIT)
				.lean()
				.exec();
		}

		// Fallback: top courses not already included
		if (courses.length < COURSE_LIMIT) {
			const fallback = await this.courseModel
				.find({ ...BASE_COURSE, _id: { $nin: courses.map((c: any) => c._id) } })
				.sort({ courseRating: -1, courseRank: -1 })
				.limit(COURSE_LIMIT - courses.length)
				.lean()
				.exec();
			courses = [...courses, ...fallback];
		}

		if (courses.length > 0) {
			results.push({
				target: RecommendationTarget.COURSE,
				items: courses.map((c: any) => c.courseTitle),
				reason: config?.reasons.course ?? 'Top rated courses',
			});
		}

		return results;
	}
}
