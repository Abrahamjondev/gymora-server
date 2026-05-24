import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BatchService } from '../batch.service';
import { BATCH_REMINDER } from '../lib/config';

@Injectable()
export class ReminderJob {
	private logger: Logger = new Logger('ReminderJob');

	constructor(private readonly batchService: BatchService) {}

	@Cron('00 00 08 * * *', { name: BATCH_REMINDER })
	public async handleReminders(): Promise<void> {
		try {
			this.logger.debug('EXECUTED');
			await this.batchService.createDailyReminders();
		} catch (err) {
			this.logger.error(err);
		}
	}
}
