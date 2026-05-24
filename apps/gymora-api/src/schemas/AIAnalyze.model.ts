import { Schema } from 'mongoose';

const AIAnalyzeSchema = new Schema(
	{
		memberId: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
		imageUrl: { type: String, required: true },
		foodName: { type: String, required: true },
		estimatedCalories: { type: Number, default: 0 },
		protein: { type: Number, default: 0 },
		carbs: { type: Number, default: 0 },
		fats: { type: Number, default: 0 },
		aiProvider: { type: String, default: 'GEMINI' },
		aiRawResult: { type: String },
	},
	{ timestamps: true, collection: 'aiAnalyzes' },
);

export default AIAnalyzeSchema;
