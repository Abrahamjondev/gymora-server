import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthMember = createParamDecorator((data: string, context: ExecutionContext | any) => {
	let request: any;
	if (context.contextType === 'graphql') {
		request = context.getArgByIndex(2).req;
	} else {
		request = context.switchToHttp().getRequest();
	}

	const member = request.authMember;
	if (!member) return null;

	if (request.headers?.authorization) {
		member.authorization = request.headers.authorization;
	}

	return data ? member?.[data] : member;
});
