import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import MealLogSchema from '../../schemas/MealLog.model';
import NutritionSchema from '../../schemas/Nutrition.model';
import { NutritionResolver } from './nutrition.resolver';
import { NutritionService } from './nutrition.service';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Nutrition', schema: NutritionSchema },
			{ name: 'MealLog', schema: MealLogSchema },
		]),
		AuthModule,
	],
	providers: [NutritionResolver, NutritionService],
	exports: [NutritionService],
})
export class NutritionModule {}
