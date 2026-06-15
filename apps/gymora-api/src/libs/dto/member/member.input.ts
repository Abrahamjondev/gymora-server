import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, Length, Min } from 'class-validator';
import { MemberAuthType, MemberStatus, MemberType } from '../../enums/member.enum';
import { availableMemberSorts, availableTrainerSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class MemberInput {
	@IsNotEmpty()
	@Length(3, 20)
	@Field(() => String)
	memberNick: string;

	@IsNotEmpty()
	@Length(5, 20)
	@Field(() => String)
	memberPassword: string;

	@IsNotEmpty()
	@Field(() => String)
	memberPhone: string;

	@IsOptional()
	@Field(() => MemberAuthType, { nullable: true })
	memberAuthType?: MemberAuthType;
}

@InputType()
export class LoginInput {
	@IsNotEmpty()
	@Length(3, 20)
	@Field(() => String)
	memberNick: string;

	@IsNotEmpty()
	@Length(5, 20)
	@Field(() => String)
	memberPassword: string;
}

@InputType()
export class TelegramAuthInput {
	// Raw fields exactly as delivered by the Telegram Login Widget.
	// All except `hash` are concatenated into the data-check-string for HMAC verification.
	@IsNotEmpty()
	@IsNumber()
	@Field(() => Float)
	id: number;

	@IsNotEmpty()
	@Field(() => String)
	first_name: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	last_name?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	username?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	photo_url?: string;

	@IsNotEmpty()
	@IsNumber()
	@Field(() => Float)
	auth_date: number;

	@IsNotEmpty()
	@Field(() => String)
	hash: string;
}

@InputType()
class TrainerSearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class TrainersInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableTrainerSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => TrainerSearch)
	search: TrainerSearch;
}

@InputType()
class MemberSearch {
	@IsOptional()
	@Field(() => MemberStatus, { nullable: true })
	memberStatus?: MemberStatus;

	@IsOptional()
	@Field(() => MemberType, { nullable: true })
	memberType?: MemberType;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class MembersInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableMemberSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => MemberSearch)
	search: MemberSearch;
}
