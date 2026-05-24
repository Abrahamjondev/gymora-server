import { Injectable } from '@nestjs/common';
import { AnalyticsInput } from '../../libs/dto/analytics/analytics.input';
import { AnalyticsResult } from '../../libs/dto/analytics/analytics';

@Injectable()
export class AnalyticsService {
	public calculate(input: AnalyticsInput): AnalyticsResult {
		const heightM = input.heightCm / 100;
		const bmi = Number((input.weightKg / (heightM * heightM)).toFixed(2));
		const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
		const bmr = Number((input.gender.toLowerCase() === 'female' ? base - 161 : base + 5).toFixed(2));
		const dailyCalories = Number((bmr * 1.35).toFixed(2));
		return { bmi, bmr, dailyCalories, summary: 'Rule-based Gymora analytics result' };
	}
}
