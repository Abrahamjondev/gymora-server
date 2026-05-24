import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { TrainerVerificationStatus } from '../../enums/gymora.enum';

@InputType()
export class TrainerInput {
	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: string;
	@IsNotEmpty()
	@Length(10, 1000)
	@Field(() => String)
	trainerBio: string;
	@IsOptional()
	@Field(() => [String], { nullable: true })
	trainerSpecializations?: string[];
	@IsOptional()
	@Min(0)
	@Field(() => Int, { nullable: true })
	trainerExperience?: number;
	@IsOptional()
	@Field(() => [String], { nullable: true })
	trainerSocialLinks?: string[];
	@IsOptional()
	@Field(() => TrainerVerificationStatus, { nullable: true })
	trainerVerificationStatus?: TrainerVerificationStatus;
}

@InputType()
export class TrainerUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: string;
	@IsOptional()
	@Field(() => String, { nullable: true })
	trainerBio?: string;
	@IsOptional()
	@Field(() => [String], { nullable: true })
	trainerSpecializations?: string[];
	@IsOptional()
	@Field(() => Int, { nullable: true })
	trainerExperience?: number;
	@IsOptional()
	@Field(() => [String], { nullable: true })
	trainerSocialLinks?: string[];
	@IsOptional()
	@Field(() => TrainerVerificationStatus, { nullable: true })
	trainerVerificationStatus?: TrainerVerificationStatus;
}
