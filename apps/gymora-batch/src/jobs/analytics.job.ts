import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BatchService } from '../batch.service';
import { BATCH_ANALYTICS } from '../lib/config';

@Injectable()
export class AnalyticsJob {
	private logger: Logger = new Logger('AnalyticsJob');

	constructor(private readonly batchService: BatchService) {}

	/** Har hafta Dushanba 01:00 da — top trainers + hot workouts + featured courses */
	@Cron('0 0 1 * * 1', { name: BATCH_ANALYTICS })
	public async handleWeeklyAnalytics(): Promise<void> {
		try {
			this.logger.log('=== Weekly Batch Analytics Started ===');
			await this.batchService.refreshAnalytics();
			this.logger.log('=== Weekly Batch Analytics Done ===');
		} catch (err) {
			this.logger.error('Batch analytics error:', err);
		}
	}
}
