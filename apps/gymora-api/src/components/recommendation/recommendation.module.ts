import { Module } from '@nestjs/common';
import { RecommendationResolver } from './recommendation.resolver';
import { RecommendationService } from './recommendation.service';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [AuthModule],
	providers: [RecommendationResolver, RecommendationService],
	exports: [RecommendationService],
})
export class RecommendationModule {}
