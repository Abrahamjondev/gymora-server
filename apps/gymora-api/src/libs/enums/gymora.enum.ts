import { registerEnumType } from '@nestjs/graphql';

export enum TrainerVerificationStatus {
	PENDING = 'PENDING',
	VERIFIED = 'VERIFIED',
	REJECTED = 'REJECTED',
}
registerEnumType(TrainerVerificationStatus, { name: 'TrainerVerificationStatus' });

export enum CourseDifficulty {
	BEGINNER = 'BEGINNER',
	INTERMEDIATE = 'INTERMEDIATE',
	ADVANCED = 'ADVANCED',
}
registerEnumType(CourseDifficulty, { name: 'CourseDifficulty' });

export enum CourseCategory {
	STRENGTH = 'STRENGTH',
	CARDIO = 'CARDIO',
	YOGA = 'YOGA',
	MOBILITY = 'MOBILITY',
	NUTRITION = 'NUTRITION',
}
registerEnumType(CourseCategory, { name: 'CourseCategory' });

export enum WorkoutDifficulty {
	BEGINNER = 'BEGINNER',
	INTERMEDIATE = 'INTERMEDIATE',
	ADVANCED = 'ADVANCED',
}
registerEnumType(WorkoutDifficulty, { name: 'WorkoutDifficulty' });

export enum MealType {
	BREAKFAST = 'BREAKFAST',
	LUNCH = 'LUNCH',
	DINNER = 'DINNER',
	SNACK = 'SNACK',
}
registerEnumType(MealType, { name: 'MealType' });

export enum SubscriptionPlan {
	MONTHLY = 'MONTHLY',
	YEARLY = 'YEARLY',
}
registerEnumType(SubscriptionPlan, { name: 'SubscriptionPlan' });

export enum SubscriptionStatus {
	ACTIVE = 'ACTIVE',
	EXPIRED = 'EXPIRED',
	CANCELED = 'CANCELED',
}
registerEnumType(SubscriptionStatus, { name: 'SubscriptionStatus' });

export enum PaymentStatus {
	PENDING = 'PENDING',
	PAID = 'PAID',
	FAILED = 'FAILED',
	REFUNDED = 'REFUNDED',
}
registerEnumType(PaymentStatus, { name: 'PaymentStatus' });

export enum NotificationType {
	SYSTEM = 'SYSTEM',
	WORKOUT = 'WORKOUT',
	NUTRITION = 'NUTRITION',
	SUBSCRIPTION = 'SUBSCRIPTION',
	CHAT = 'CHAT',
}
registerEnumType(NotificationType, { name: 'NotificationType' });

export enum RecommendationTarget {
	TRAINER = 'TRAINER',
	WORKOUT = 'WORKOUT',
	COURSE = 'COURSE',
	NUTRITION = 'NUTRITION',
}
registerEnumType(RecommendationTarget, { name: 'RecommendationTarget' });

export enum Gender {
	MALE = 'MALE',
	FEMALE = 'FEMALE',
}
registerEnumType(Gender, { name: 'Gender' });

export enum ActivityLevel {
	SEDENTARY = 'SEDENTARY',
	LIGHTLY_ACTIVE = 'LIGHTLY_ACTIVE',
	MODERATELY_ACTIVE = 'MODERATELY_ACTIVE',
	VERY_ACTIVE = 'VERY_ACTIVE',
	EXTRA_ACTIVE = 'EXTRA_ACTIVE',
}
registerEnumType(ActivityLevel, { name: 'ActivityLevel' });

export enum FitnessGoal {
	WEIGHT_LOSS = 'WEIGHT_LOSS',
	MAINTENANCE = 'MAINTENANCE',
	MUSCLE_GAIN = 'MUSCLE_GAIN',
}
registerEnumType(FitnessGoal, { name: 'FitnessGoal' });

export enum PaymentProvider {
	STRIPE = 'STRIPE',
	PAYME = 'PAYME',
}
registerEnumType(PaymentProvider, { name: 'PaymentProvider' });

export enum BoardArticleCategory {
	FITNESS_TIPS = 'FITNESS_TIPS',
	NUTRITION = 'NUTRITION',
	WORKOUT_GUIDE = 'WORKOUT_GUIDE',
	CHALLENGE = 'CHALLENGE',
	SUCCESS_STORY = 'SUCCESS_STORY',
}
registerEnumType(BoardArticleCategory, { name: 'BoardArticleCategory' });

export enum BoardArticleStatus {
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}
registerEnumType(BoardArticleStatus, { name: 'BoardArticleStatus' });
