import { Schema } from 'mongoose';
import { TrainerVerificationStatus } from '../libs/enums/gymora.enum';

const TrainerSchema = new Schema(
	{
		memberId: { type: Schema.Types.ObjectId, required: true, unique: true, ref: 'Member' },
		trainerBio: { type: String, required: true },
		trainerSpecializations: { type: [String], default: [] },
		trainerExperience: { type: Number, default: 0 },
		trainerRating: { type: Number, default: 0 },
		trainerSocialLinks: { type: [String], default: [] },
		trainerVerificationStatus: {
			type: String,
			enum: TrainerVerificationStatus,
			default: TrainerVerificationStatus.PENDING,
		},
		deletedAt: { type: Date },
	},
	{ timestamps: true, collection: 'trainers' },
);

export default TrainerSchema;
