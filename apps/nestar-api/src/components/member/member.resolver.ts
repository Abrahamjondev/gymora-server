import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import * as mongoose from 'mongoose';

@Resolver()
export class MemberResolver {
	constructor(private readonly memberService: MemberService) {}

	@Mutation(() => Member)
	public async signup(@Args('input') input: MemberInput): Promise<Member> {
		console.log('Mutation signup ');
		return this.memberService.signup(input);
	}
	@Mutation(() => Member)
	public async login(@Args('input') input: LoginInput): Promise<Member> {
		console.log('Mutation login ');
		return this.memberService.login(input);
	}
	//Authenticated
	@UseGuards(AuthGuard)
	@Mutation(() => String)
	public async updateMember(@AuthMember('_id') ObjectId: mongoose.ObjectId): Promise<string> {
		console.log('Mutation updateMember ');
		return this.memberService.updateMember();
	}

	@UseGuards(AuthGuard)
	@Query(() => String)
	public async checkAuth(@AuthMember('memberNick') memberNick: string): Promise<string> {
		console.log('Query checkAuth ');
		console.log('membernick', memberNick);

		return `Hi ${memberNick}, you are authenticated!`;
	}

	@Query(() => String)
	public async getMember(): Promise<string> {
		console.log('Query getMember ');
		return this.memberService.getMember();
	}

	/** ADMIN **/

	//Authorization: Admin
	@Mutation(() => String)
	public async getAllMemberByAdmin(): Promise<string> {
		return this.memberService.getAllMemberByAdmin();
	}

	//Authorization: Admin
	@Mutation(() => String)
	public async updateMemberByAdmin(): Promise<string> {
		console.log('Mutation updateMemberByAdmin ');
		return this.memberService.updateMemberByAdmin();
	}
}
