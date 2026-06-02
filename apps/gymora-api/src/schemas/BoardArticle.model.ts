import { Schema } from 'mongoose';

const BoardArticleSchema = new Schema(
	{
		articleCategory: {
			type: String,
			enum: ['FITNESS_TIPS', 'NUTRITION', 'WORKOUT_GUIDE', 'CHALLENGE', 'SUCCESS_STORY'],
			required: true,
		},
		articleStatus: {
			type: String,
			enum: ['ACTIVE', 'DELETE'],
			default: 'ACTIVE',
		},
		articleTitle: { type: String, required: true },
		articleContent: { type: String, required: true },
		articleImage: { type: String },
		articleLikes: { type: Number, default: 0 },
		articleViews: { type: Number, default: 0 },
		articleComments: { type: Number, default: 0 },
		memberId: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
	},
	{ timestamps: true, collection: 'boardArticles' },
);

export default BoardArticleSchema;
