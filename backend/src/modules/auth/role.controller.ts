import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guard/auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('auth')
@UseGuards(AuthGuard, RolesGuard)
export class RoleController {
  @Get('admin')
  @Roles(Role.ADMIN)
  getAdminData() {
    return { message: 'Admin access granted' };
  }

  @Get('faculty')
  @Roles(Role.FACULTY)
  getFacultyData() {
    return { message: 'Faculty access granted' };
  }

  @Get('student')
  @Roles(Role.STUDENT)
  getStudentData() {
    return { message: 'Student access granted' };
  }
}
