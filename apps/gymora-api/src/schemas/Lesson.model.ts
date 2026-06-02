import { Schema } from 'mongoose';

const LessonSchema = new Schema(
	{
		courseId: { type: Schema.Types.ObjectId, required: true, ref: 'Course' },
		title: { type: String, required: true },
		description: { type: String },
		videoUrl: { type: String, default: '' },
		weekNumber: { type: Number, required: true, default: 1 },
		order: { type: Number, required: true, default: 1 },
		duration: { type: Number, default: 0 }, // minutes
		deletedAt: { type: Date },
	},
	{ timestamps: true, collection: 'lessons' },
);

export default LessonSchema;
