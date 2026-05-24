import { Field, ObjectType } from '@nestjs/graphql';
import { RecommendationTarget } from '../../enums/gymora.enum';

@ObjectType()
export class Recommendation {
	@Field(() => RecommendationTarget)
	target: RecommendationTarget;
	@Field(() => [String])
	items: string[];
	@Field(() => String)
	reason: string;
}
