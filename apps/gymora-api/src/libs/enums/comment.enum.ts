import { registerEnumType } from '@nestjs/graphql';

export enum CommentStatus {
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}
registerEnumType(CommentStatus, {
	name: 'CommentStatus',
});

export enum CommentGroup {
	MEMBER = 'MEMBER',
	TRAINER = 'TRAINER',
	COURSE = 'COURSE',
	WORKOUT = 'WORKOUT',
	ARTICLE = 'ARTICLE',
}
registerEnumType(CommentGroup, {
	name: 'CommentGroup',
});
