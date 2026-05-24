import { Schema } from 'mongoose';

const NutritionSchema = new Schema(
	{
		memberId: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
		nutritionDate: { type: Date, required: true },
		totalCalories: { type: Number, default: 0 },
		totalProtein: { type: Number, default: 0 },
		totalCarbs: { type: Number, default: 0 },
		totalFats: { type: Number, default: 0 },
	},
	{ timestamps: true, collection: 'nutritions' },
);

export default NutritionSchema;
