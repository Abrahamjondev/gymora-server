import { Controller, Get, Logger } from '@nestjs/common';
import { BatchService } from './batch.service';
import { Timeout } from '@nestjs/schedule';

@Controller()
export class BatchController {
	private logger: Logger = new Logger('BatchController');

	constructor(private readonly BatchService: BatchService) {}

	@Timeout(1000)
	handleTimeout() {
		this.logger.debug('BATCH SERVER READY');
	}

	@Get()
	getHello(): string {
		return this.BatchService.getHello();
	}
}
