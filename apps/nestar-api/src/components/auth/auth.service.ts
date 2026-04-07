import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
	public async hashPassword(memberPassword: string): Promise<string> {
		//TODO hash password
		const salt = await bcrypt.genSalt();

		return await bcrypt.hash(memberPassword, salt);
	}
	public async comparePassword(passwords: string, hashedPassword: string): Promise<boolean> {
		return await bcrypt.compare(passwords, hashedPassword);
	}
}
