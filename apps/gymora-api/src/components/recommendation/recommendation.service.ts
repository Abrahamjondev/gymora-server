import { Injectable } from '@nestjs/common';
import { Recommendation } from '../../libs/dto/recommendation/recommendation';
import { RecommendationInput } from '../../libs/dto/recommendation/recommendation.input';
import { RecommendationTarget } from '../../libs/enums/gymora.enum';

@Injectable()
export class RecommendationService {
	public recommend(input: RecommendationInput): Recommendation[] {
		const goals = input.goals?.join(', ') || 'general fitness';
		return [
			{ target: RecommendationTarget.TRAINER, items: ['verified-strength-trainers'], reason: `Matched goals: ${goals}` },
			{ target: RecommendationTarget.WORKOUT, items: ['beginner-full-body', 'cardio-foundation'], reason: 'Simple rule-based workout fit' },
			{ target: RecommendationTarget.NUTRITION, items: ['high-protein-plan', 'balanced-meal-plan'], reason: 'Balanced nutrition starter plan' },
		];
	}
}
