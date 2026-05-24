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
			type: [
				{
					exerciseName: String,
					sets: Number,
					reps: Number,
					duration: Number,
				},
			],
			default: [],
		},
		deletedAt: { type: Date },
	},
	{ timestamps: true, collection: 'workouts' },
);

export default WorkoutSchema;
