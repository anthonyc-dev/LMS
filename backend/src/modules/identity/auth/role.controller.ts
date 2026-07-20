import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from 'src/common/guard/passport-auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoleController {
  @Get('admin')
  @Roles(Role.ADMIN)
  getAdminData() {
    return { message: 'Admin access granted' };
  }

  // this only for UI demonstration
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
