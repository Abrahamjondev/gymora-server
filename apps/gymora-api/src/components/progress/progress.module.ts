import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import ProgressSchema from '../../schemas/Progress.model';
import { ProgressResolver } from './progress.resolver';
import { ProgressService } from './progress.service';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Progress', schema: ProgressSchema }]), AuthModule],
	providers: [ProgressResolver, ProgressService],
	exports: [ProgressService],
})
export class ProgressModule {}
