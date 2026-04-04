import { Injectable } from '@nestjs/common';

@Injectable()
export class MemberService {
	public async signup(): Promise<string> {
		return 'Sign up successful';
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
