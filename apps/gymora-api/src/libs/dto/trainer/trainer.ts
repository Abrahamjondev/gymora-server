import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { type ObjectId } from 'mongoose';
import { TrainerVerificationStatus } from '../../enums/gymora.enum';
import { MeLiked } from '../like/like';

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
	@Field(() => Int, { nullable: true })
	trainerRatingCount?: number;
	@Field(() => [String])
	trainerSocialLinks: string[];
	@Field(() => TrainerVerificationStatus)
	trainerVerificationStatus: TrainerVerificationStatus;
	@Field(() => Float, { nullable: true })
	trainerRank?: number;
	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];
	@Field(() => Date)
	createdAt: Date;
	@Field(() => Date)
	updatedAt: Date;
}

@ObjectType()
class TrainerCounter {
	@Field(() => Int)
	total: number;
}

@ObjectType()
export class Trainers {
	@Field(() => [Trainer])
	list: Trainer[];

	@Field(() => [TrainerCounter])
	metaCounter: TrainerCounter[];
}
