import { AnalyticsController } from './analytics.controller';
import { Role } from 'src/common/enums/role.enum';

describe('AnalyticsController', () => {
  it('uses authenticated JWT subject for personal dashboard data', async () => {
    const getUserDashboardStats = jest.fn();
    const controller = new AnalyticsController({
      getUserDashboardStats,
    } as never);

    await controller.getUserDashboardStats({
      user: {
        sub: 'faculty-user-id',
        email: 'faculty@example.test',
        role: Role.FACULTY,
      },
    } as never);

    expect(getUserDashboardStats).toHaveBeenCalledWith('faculty-user-id');
  });
});
