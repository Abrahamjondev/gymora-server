import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BatchService } from '../batch.service';
import { BATCH_SUBSCRIPTION } from '../lib/config';

@Injectable()
export class SubscriptionJob {
	private logger: Logger = new Logger('SubscriptionJob');

	constructor(private readonly batchService: BatchService) {}

	@Cron('10 00 01 * * *', { name: BATCH_SUBSCRIPTION })
	public async handleSubscriptions(): Promise<void> {
		try {
			this.logger.debug('EXECUTED');
			await this.batchService.expireSubscriptions();
		} catch (err) {
			this.logger.error(err);
		}
	}
}
