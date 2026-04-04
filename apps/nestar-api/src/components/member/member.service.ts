import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import { MemberInput } from '../../libs/dto/member/member.input';

@Injectable()
export class MemberService {
	constructor(@InjectModel('Member') private readonly memberModel: Model<Member>) {}

	public async signup(input: MemberInput): Promise<Member> {
		//TODO hash password
		try {
			const reesult = await this.memberModel.create(input);
			//TODO Authentication cisa TOKEN
			return reesult;
		} catch (err) {
			console.log('Error, service model', err);
			throw new BadGatewayException(err);
		}
	}
	public async login(): Promise<string> {
		return 'Login successful';
	}
	public async updateMember(): Promise<string> {
		return 'Member updated successfully';
	}
	public async getMember(): Promise<string> {
		return 'Member retrieved successfully';
	}
}
