import { registerEnumType } from '@nestjs/graphql';

export enum LikeGroup {
	MEMBER = 'MEMBER',
	TRAINER = 'TRAINER',
	COURSE = 'COURSE',
	WORKOUT = 'WORKOUT',
}
registerEnumType(LikeGroup, {
	name: 'LikeGroup',
});
