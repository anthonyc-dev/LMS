import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import express from 'express';
import { JwtAuthGuard } from 'src/common/guard/passport-auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { JwtPayload } from 'src/common/guard/auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getAdminDashboardStats() {
    return this.analyticsService.getAdminDashboardStats();
  }

  @Get('user')
  getUserDashboardStats(
    @Req() req: express.Request & { user: JwtPayload },
  ) {
    return this.analyticsService.getUserDashboardStats(req.user.sub);
  }
}
