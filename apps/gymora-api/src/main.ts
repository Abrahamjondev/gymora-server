import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';
import { graphqlUploadExpress } from 'graphql-upload';
import express from 'express';

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
	app.use('/uploads', express.static('uploads'));
	await app.listen(process.env.PORT_API ?? 3000);
}
bootstrap();
