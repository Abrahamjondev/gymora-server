import { Schema } from 'mongoose';
import { WorkoutDifficulty } from '../libs/enums/gymora.enum';

const WorkoutSchema = new Schema(
	{
		memberId: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
		workoutTitle: { type: String, required: true },
		workoutDesc: { type: String },
		workoutDifficulty: { type: String, enum: WorkoutDifficulty, required: true },
		targetMuscle: { type: String, required: true },
		estimatedCaloriesBurned: { type: Number, default: 0 },
		exercises: {
			type: [{ exerciseName: String, sets: Number, reps: Number, duration: Number }],
			default: [],
		},
		videoUrl: { type: String, default: '' },
		// Freemium model
		isFree: { type: Boolean, default: true },
		courseId: { type: Schema.Types.ObjectId, ref: 'Course', default: null },
		workoutThumbnail: { type: String, default: '' },
		workoutViews: { type: Number, default: 0 },
		workoutLikes: { type: Number, default: 0 },
		workoutRating: { type: Number, default: 0 },
		workoutRatingCount: { type: Number, default: 0 },
		workoutRank: { type: Number, default: 0 },
		deletedAt: { type: Date },
	},
	{ timestamps: true, collection: 'workouts' },
);

WorkoutSchema.index({ memberId: 1, deletedAt: 1 });
WorkoutSchema.index({ isFree: 1, deletedAt: 1 });
WorkoutSchema.index({ workoutRating: -1 });
WorkoutSchema.index({ createdAt: -1 });

export default WorkoutSchema;
