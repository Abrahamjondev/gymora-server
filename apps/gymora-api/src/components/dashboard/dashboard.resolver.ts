import { Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DashboardStats } from '../../libs/dto/dashboard/dashboard';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';

@Resolver()
export class DashboardResolver {
	constructor(private readonly dashboardService: DashboardService) {}

	@UseGuards(AuthGuard)
	@Query(() => DashboardStats)
	public async getDashboardStats(@AuthMember('_id') memberId: ObjectId): Promise<DashboardStats> {
		return await this.dashboardService.getDashboardStats(memberId.toString());
	}
}
