import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { type ObjectId } from 'mongoose';
import { TrainerVerificationStatus } from '../../enums/gymora.enum';

@ObjectType()
export class Trainer {
	@Field(() => String)
	_id: ObjectId;
	@Field(() => String)
	memberId: ObjectId;
	@Field(() => String)
	trainerBio: string;
	@Field(() => [String])
	trainerSpecializations: string[];
	@Field(() => Int)
	trainerExperience: number;
	@Field(() => Float)
	trainerRating: number;
	@Field(() => [String])
	trainerSocialLinks: string[];
	@Field(() => TrainerVerificationStatus)
	trainerVerificationStatus: TrainerVerificationStatus;
	@Field(() => Date)
	createdAt: Date;
	@Field(() => Date)
	updatedAt: Date;
}
