import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { ComponentsModule } from './components/components.module';
import { DatabaseModule } from './database/database.module';
import { T } from './libs/types/common';
import { SocketModule } from './socket/socket.module';
import { GymoraBatchController } from './gymora-batch/gymora-batch.controller';

@Module({
	imports: [
		ConfigModule.forRoot(),
		GraphQLModule.forRoot({
			driver: ApolloDriver,
			playground: process.env.NODE_ENV !== 'production',
			uploads: false,
			autoSchemaFile: true,
			formatError: (error: T) => {
				const validationMessage = error?.extensions?.exception?.response?.message;
				const responseMessage = error?.extensions?.response?.message;
				const originalMessage = error?.extensions?.originalError?.message;
				const message = validationMessage ?? responseMessage ?? originalMessage ?? error?.message;
				const normalizedMessage = Array.isArray(message) ? message.join('; ') : message;
				const graphQLFormattedError = {
					code: error?.extensions.code,
					message: normalizedMessage,
				};
				console.log('GRAPHQL GLOBAL ERR:', graphQLFormattedError);

				return graphQLFormattedError;
			},
		}),
		ComponentsModule,
		DatabaseModule,
		SocketModule,
	],
	controllers: [AppController, GymoraBatchController],
	providers: [AppService, AppResolver],
})
export class AppModule {}
