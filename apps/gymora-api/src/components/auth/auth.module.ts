import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
	imports: [
		HttpModule,
		ConfigModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				const secret = configService.get<string>('SECRET_TOKEN');
				if (!secret || secret.trim() === '') {
					throw new Error('SECRET_TOKEN environment variable is required and cannot be empty.');
				}
				return {
					secret,
					signOptions: { expiresIn: '30d' },
				};
			},
		}),
	],
	providers: [AuthService],
	exports: [AuthService],
})
export class AuthModule {}
