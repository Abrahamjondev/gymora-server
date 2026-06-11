import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Course, Courses } from '../../libs/dto/course/course';
import { CourseInput, CourseUpdate, CoursesInquiry } from '../../libs/dto/course/course.input';
import { CourseService } from './course.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { WithoutGuard } from '../auth/guards/without.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';
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

	@UseGuards(WithoutGuard)
	@Query(() => Course)
	public async getCourse(
		@Args('courseId') courseId: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Course> {
		return await this.courseService.getCourse(courseId, memberId);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Courses)
	public async getCourses(
		@Args('input') input: CoursesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Courses> {
		return await this.courseService.getCourses(input, memberId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Course)
	public async likeTargetCourse(
		@Args('courseId') courseId: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Course> {
		return await this.courseService.likeTargetCourse(memberId, courseId);
	}

	@UseGuards(AuthGuard)
	@Query(() => [Course])
	public async getTrainerCourses(@AuthMember('_id') memberId: ObjectId): Promise<Course[]> {
		return await this.courseService.getTrainerCourses(memberId.toString());
	}

	@UseGuards(AuthGuard)
	@Query(() => [Course])
	public async getMemberPurchasedCourses(@AuthMember('_id') memberId: ObjectId): Promise<Course[]> {
		return await this.courseService.getMemberPurchasedCourses(memberId.toString());
	}

	@Query(() => [Course])
	public async getCoursesByTrainerId(@Args('trainerId') trainerId: string): Promise<Course[]> {
		return await this.courseService.getCoursesByTrainerId(trainerId);
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

	/** Stripe Checkout Session URL yaratadi (pullik kurslar uchun) */
	@UseGuards(AuthGuard)
	@Mutation(() => String)
	public async createCourseCheckoutSession(
		@Args('courseId') courseId: string,
		@Args('baseUrl') baseUrl: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<string> {
		return await this.courseService.createCheckoutSession(courseId, memberId.toString(), baseUrl);
	}

	/** Stripe to'lovi tasdiqlangandan keyin enrollment */
	@UseGuards(AuthGuard)
	@Mutation(() => Course)
	public async confirmCoursePayment(
		@Args('sessionId') sessionId: string,
		@Args('courseId') courseId: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Course> {
		return await this.courseService.confirmCoursePayment(sessionId, courseId, memberId.toString());
	}

	/** ADMIN **/

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Courses)
	public async getAllCoursesByAdmin(@Args('input') input: CoursesInquiry): Promise<Courses> {
		console.log('Query getAllCoursesByAdmin');
		return await this.courseService.getAllCoursesByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Course)
	public async updateCourseByAdmin(@Args('input') input: CourseUpdate): Promise<Course> {
		console.log('Mutation updateCourseByAdmin');
		return await this.courseService.updateCourseByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Course)
	public async deleteCourseByAdmin(@Args('courseId') courseId: string): Promise<Course> {
		console.log('Mutation deleteCourseByAdmin');
		return await this.courseService.deleteCourseByAdmin(courseId);
	}
}
