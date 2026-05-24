import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BatchService } from '../batch.service';
import { BATCH_NUTRITION } from '../lib/config';

@Injectable()
export class NutritionJob {
	private logger: Logger = new Logger('NutritionJob');

	constructor(private readonly batchService: BatchService) {}

	@Cron('30 00 23 * * *', { name: BATCH_NUTRITION })
	public async handleNutrition(): Promise<void> {
		try {
			this.logger.debug('EXECUTED');
			await this.batchService.summarizeNutrition();
		} catch (err) {
			this.logger.error(err);
		}
	}
}
