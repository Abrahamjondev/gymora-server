import { Schema } from 'mongoose';

const ReviewSchema = new Schema(
	{
		memberId: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
		trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer' },
		courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
		workoutId: { type: Schema.Types.ObjectId, ref: 'Workout' },
		reviewRating: { type: Number, required: true, min: 1, max: 5 },
		reviewText: { type: String },
	},
	{ timestamps: true, collection: 'reviews' },
);

ReviewSchema.index({ memberId: 1, trainerId: 1 }, { sparse: true });
ReviewSchema.index({ memberId: 1, courseId: 1 }, { sparse: true });
ReviewSchema.index({ memberId: 1, workoutId: 1 }, { sparse: true });
ReviewSchema.index({ trainerId: 1 });
ReviewSchema.index({ courseId: 1 });
ReviewSchema.index({ workoutId: 1 });

export default ReviewSchema;
