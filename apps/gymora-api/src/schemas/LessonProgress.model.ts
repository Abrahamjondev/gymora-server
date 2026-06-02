import { Schema } from 'mongoose';

const LessonProgressSchema = new Schema(
	{
		memberId: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
		courseId: { type: Schema.Types.ObjectId, required: true, ref: 'Course' },
		lessonId: { type: Schema.Types.ObjectId, required: true, ref: 'Lesson' },
		isCompleted: { type: Boolean, default: false },
		completedAt: { type: Date },
		unlockedAt: { type: Date, required: true },
	},
	{ timestamps: true, collection: 'lesson_progresses' },
);

LessonProgressSchema.index({ memberId: 1, lessonId: 1 }, { unique: true });
LessonProgressSchema.index({ memberId: 1, courseId: 1 });

export default LessonProgressSchema;
