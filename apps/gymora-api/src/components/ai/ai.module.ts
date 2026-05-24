import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import AIAnalyzeSchema from '../../schemas/AIAnalyze.model';
import { AiResolver } from './ai.resolver';
import { AiService } from './ai.service';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [ConfigModule, MongooseModule.forFeature([{ name: 'AIAnalyze', schema: AIAnalyzeSchema }]), AuthModule],
	providers: [AiResolver, AiService],
	exports: [AiService],
})
export class AiModule {}
