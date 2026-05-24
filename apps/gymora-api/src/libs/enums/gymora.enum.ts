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
	NUTRITION = 'NUTRITION',
}
registerEnumType(RecommendationTarget, { name: 'RecommendationTarget' });
