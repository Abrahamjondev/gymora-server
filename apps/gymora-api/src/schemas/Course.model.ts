import { Schema } from 'mongoose';
import { CourseCategory, CourseDifficulty } from '../libs/enums/gymora.enum';

const CourseSchema = new Schema(
	{
		trainerId: { type: Schema.Types.ObjectId, required: true, ref: 'Trainer' },
		courseTitle: { type: String, required: true },
		courseDesc: { type: String },
		courseDifficulty: { type: String, enum: CourseDifficulty, required: true },
		courseCategory: { type: String, enum: CourseCategory, required: true },
		coursePrice: { type: Number, default: 0 },
		courseDuration: { type: Number, required: true },
		courseThumbnail: { type: String },
		courseVideos: { type: [String], default: [] },
		purchasedMembers: [{ type: Schema.Types.ObjectId, ref: 'Member' }],
		courseRating: { type: Number, default: 0 },
		courseRatingCount: { type: Number, default: 0 },
		courseRank: { type: Number, default: 0 },
		deletedAt: { type: Date },
	},
	{ timestamps: true, collection: 'courses' },
);

CourseSchema.index({ trainerId: 1, deletedAt: 1 });
CourseSchema.index({ purchasedMembers: 1 });
CourseSchema.index({ courseRating: -1 });
CourseSchema.index({ createdAt: -1 });

export default CourseSchema;
