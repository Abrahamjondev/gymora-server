import { BadGatewayException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Int } from '@nestjs/graphql';
import { MemberStatus } from '../../libs/enums/member.enum';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class MemberService {
	constructor(@InjectModel('Member') private readonly memberModel: Model<Member>) {}

	public async signup(input: MemberInput): Promise<Member> {
		//TODO hash password
		try {
			const reesult = await this.memberModel.create(input);
			//TODO Authentication via TOKEN
			return reesult;
		} catch (err: any) {
			console.log('Error, service model', err.message);
			throw new BadGatewayException(Message.USED_MEMBER_NICK_OR_PHONE);
		}
	}
	public async login(input: LoginInput): Promise<Member> {
		const { memberNick, memberPassword } = input;
		const response = await this.memberModel.findOne({ memberNick: memberNick }).select('+memberPassword').exec();

		if (!response || response.memberStatus === MemberStatus.DELETE) {
			throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
		} else if (response.memberStatus === MemberStatus.BLOCK) {
			throw new InternalServerErrorException(Message.BLOCKED_USER);
		}
		//TODO compare password

		const isMarch = memberPassword === response.memberPassword;
		if (!isMarch) {
			throw new InternalServerErrorException(Message.WRONG_PASSWORD);
		}

		return response;
	}
	public async updateMember(): Promise<string> {
		return 'Member updated successfully';
	}
	public async getMember(): Promise<string> {
		return 'Member retrieved successfully';
	}
}
