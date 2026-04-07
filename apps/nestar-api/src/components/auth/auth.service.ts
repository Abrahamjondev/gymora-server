import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Member } from '../../libs/dto/member/member';
import { T } from '../../libs/types/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
	constructor(private jwtService: JwtService) {}

	public async hashPassword(memberPassword: string): Promise<string> {
		//TODO hash password
		const salt = await bcrypt.genSalt();

		return await bcrypt.hash(memberPassword, salt);
	}
	public async comparePassword(passwords: string, hashedPassword: string): Promise<boolean> {
		return await bcrypt.compare(passwords, hashedPassword);
	}
	public async createToken(member: Member): Promise<string> {
		console.log('Member:', member);

		const payload: T = {};
		Object.keys(member['_doc'] ? member['_doc'] : member).map((ele) => {
			payload[`${ele}`] = member[`${ele}`];
		});
		delete payload.memberPassword;
		console.log('Payload:', payload);

		return await this.jwtService.signAsync(payload);
	}
	public async verifyToken(token: string): Promise<Member> {
		const member = await this.jwtService.verifyAsync(token);
		return member;
	}
}
