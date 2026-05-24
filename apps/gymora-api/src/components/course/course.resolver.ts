import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Course } from '../../libs/dto/course/course';
import { CourseInput, CourseUpdate } from '../../libs/dto/course/course.input';
import { CourseService } from './course.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';

@Resolver()
export class CourseResolver {
	constructor(private readonly courseService: CourseService) {}

	@UseGuards(AuthGuard)
	@Mutation(() => Course)
	public async createCourse(@Args('input') input: CourseInput, @AuthMember('_id') memberId: ObjectId): Promise<Course> {
		return await this.courseService.createCourse(memberId.toString(), input);
	}

	@Query(() => Course)
	public async getCourse(@Args('courseId') courseId: string): Promise<Course> {
		return await this.courseService.getCourse(courseId);
	}

	@Query(() => [Course])
	public async getCourses(): Promise<Course[]> {
		return await this.courseService.getCourses();
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Course)
	public async updateCourse(@Args('input') input: CourseUpdate, @AuthMember('_id') memberId: ObjectId): Promise<Course> {
		return await this.courseService.updateCourse(memberId.toString(), input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Course)
	public async purchaseCourse(@Args('courseId') courseId: string, @AuthMember('_id') memberId: ObjectId): Promise<Course> {
		return await this.courseService.purchaseCourse(courseId, memberId.toString());
	}
}
