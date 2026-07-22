import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';
import { graphqlUploadExpress } from 'graphql-upload';
import express from 'express';
import { resolve } from 'path';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe());
	app.useGlobalInterceptors(new LoggingInterceptor());
	const allowedOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '')
		.split(',')
		.map((origin) => origin.trim())
		.filter(Boolean);
	app.enableCors({
		origin: process.env.NODE_ENV === 'production' ? allowedOrigins : true,
		credentials: true,
	});

	app.use(graphqlUploadExpress({ maxFileSize: 500 * 1024 * 1024, maxFiles: 10 })); // 500MB for video
	// Keep both upload roots available. Production historically served `uploads`
	// from the process working directory, while the monorepo API keeps seeded
	// assets under `apps/gymora-api/uploads`. Stored GraphQL paths stay unchanged.
	const uploadRoots = [
		process.env.UPLOADS_DIR ? resolve(process.env.UPLOADS_DIR) : null,
		resolve(process.cwd(), 'uploads'),
		resolve(process.cwd(), 'apps/gymora-api/uploads'),
		resolve(__dirname, '../uploads'),
	].filter((root): root is string => Boolean(root));
	[...new Set(uploadRoots)].forEach((uploadRoot) => app.use('/uploads', express.static(uploadRoot)));
	await app.listen(process.env.PORT_API ?? 3000);
}
bootstrap();
