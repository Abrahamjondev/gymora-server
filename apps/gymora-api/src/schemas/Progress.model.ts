import { Schema } from 'mongoose';

const ProgressSchema = new Schema(
	{
		memberId: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
		progressDate: { type: Date, required: true },
		weight: { type: Number, required: true },
		chest: { type: Number },
		waist: { type: Number },
		hips: { type: Number },
		bodyFat: { type: Number },
		progressPhotos: { type: [String], default: [] },
		progressNote: { type: String },
	},
	{ timestamps: true, collection: 'progresses' },
);

export default ProgressSchema;
