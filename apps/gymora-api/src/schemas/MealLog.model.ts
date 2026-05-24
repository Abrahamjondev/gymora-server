import { Schema } from 'mongoose';
import { MealType } from '../libs/enums/gymora.enum';

const MealLogSchema = new Schema(
	{
		memberId: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
		mealType: { type: String, enum: MealType, required: true },
		mealName: { type: String, required: true },
		calories: { type: Number, required: true },
		protein: { type: Number, default: 0 },
		carbs: { type: Number, default: 0 },
		fats: { type: Number, default: 0 },
		mealDate: { type: Date, required: true },
		mealImage: { type: String },
	},
	{ timestamps: true, collection: 'mealLogs' },
);

export default MealLogSchema;
