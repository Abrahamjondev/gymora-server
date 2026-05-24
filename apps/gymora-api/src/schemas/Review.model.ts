import { Schema } from 'mongoose';

const ReviewSchema = new Schema(
	{
		memberId: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
		trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer' },
		courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
		reviewRating: { type: Number, required: true },
		reviewText: { type: String },
	},
	{ timestamps: true, collection: 'reviews' },
);

export default ReviewSchema;
