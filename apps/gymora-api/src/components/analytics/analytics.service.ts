import { Injectable } from '@nestjs/common';
import { AnalyticsInput } from '../../libs/dto/analytics/analytics.input';
import { AnalyticsResult } from '../../libs/dto/analytics/analytics';

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
	SEDENTARY: 1.2,
	LIGHTLY_ACTIVE: 1.375,
	MODERATELY_ACTIVE: 1.55,
	VERY_ACTIVE: 1.725,
	EXTRA_ACTIVE: 1.9,
};

@Injectable()
export class AnalyticsService {
	public calculate(input: AnalyticsInput): AnalyticsResult {
		const heightM = input.heightCm / 100;
		const bmi = Number((input.weightKg / (heightM * heightM)).toFixed(2));

		// Mifflin-St Jeor BMR
		const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
		const isFemale = input.gender?.toUpperCase() === 'FEMALE';
		const bmr = Number((isFemale ? base - 161 : base + 5).toFixed(2));

		const multiplier = ACTIVITY_MULTIPLIERS[input.activityLevel?.toUpperCase()] ?? 1.55;
		const dailyCalories = Number((bmr * multiplier).toFixed(2));

		const bmiCategory =
			bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';

		return {
			bmi,
			bmr,
			dailyCalories,
			summary: `BMI: ${bmi} (${bmiCategory}). Daily calorie target: ${dailyCalories} kcal.`,
		};
	}
}
