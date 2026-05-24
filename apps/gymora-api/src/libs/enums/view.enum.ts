import { registerEnumType } from '@nestjs/graphql';

export enum ViewGroup {
	MEMBER = 'MEMBER',
	TRAINER = 'TRAINER',
	COURSE = 'COURSE',
	WORKOUT = 'WORKOUT',
}
registerEnumType(ViewGroup, {
	name: 'ViewGroup',
});
