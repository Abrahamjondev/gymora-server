import { Args, Query, Resolver } from '@nestjs/graphql';
import { AnalyticsResult } from '../../libs/dto/analytics/analytics';
import { AnalyticsInput } from '../../libs/dto/analytics/analytics.input';
import { AnalyticsService } from './analytics.service';

@Resolver()
export class AnalyticsResolver {
	constructor(private readonly analyticsService: AnalyticsService) {}

	@Query(() => AnalyticsResult)
	public async calculateAnalytics(@Args('input') input: AnalyticsInput): Promise<AnalyticsResult> {
		return this.analyticsService.calculate(input);
	}
}
