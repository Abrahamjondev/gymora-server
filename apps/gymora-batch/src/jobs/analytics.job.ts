import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BatchService } from '../batch.service';
import { BATCH_ANALYTICS } from '../lib/config';

@Injectable()
export class AnalyticsJob {
	private logger: Logger = new Logger('AnalyticsJob');

	constructor(private readonly batchService: BatchService) {}

	@Cron('00 00 01 * * *', { name: BATCH_ANALYTICS })
	public async handleAnalytics(): Promise<void> {
		try {
			this.logger.debug('EXECUTED');
			await this.batchService.refreshAnalytics();
		} catch (err) {
			this.logger.error(err);
		}
	}
}
