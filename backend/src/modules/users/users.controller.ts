import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Ip,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from 'src/common/guard/passport-auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Throttle } from '@nestjs/throttler';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UseGuards } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { HttpStatus } from '@nestjs/common';
import { HttpCode } from '@nestjs/common';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { DepartmentEnum, YearLevelEnum } from 'src/common/enums/enum.enums';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // CREATE USER
  @Throttle({ default: { limit: 5, ttl: 60000 } }) //for development only
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() userData: CreateAdminUserDto,
    @Ip() ip: string,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.createAdminUser(userData, ip);

    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  // GET ALL USERS (PAGINATED)
  @Throttle({ default: { limit: 60, ttl: 60000 } }) //for development only
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.usersService.findAll(page, limit);
  }

  // GET ENUMS FORMS
  @Public()
  // @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  @Get('meta')
  getMeta() {
    return {
      departments: Object.entries(DepartmentEnum).map(([key, value]) => ({
        value: key,
        label: value,
      })),

      yearLevels: Object.entries(YearLevelEnum).map(([key, value]) => ({
        value: key,
        label: value,
      })),
    };
  }

  // GET USER BY EMAIL
  @Throttle({ default: { limit: 30, ttl: 60000 } }) //for development only
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get('email/:email')
  findByEmail(@Param('email') email: string): Promise<User | null> {
    return this.usersService.findByEmail(email);
  }

  // GET USER BY ID
  @Throttle({ default: { limit: 60, ttl: 60000 } }) //for development only
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<User | null> {
    return this.usersService.findById(id);
  }

  // UPDATE USER
  @Throttle({ default: { limit: 5, ttl: 60000 } }) //for development only
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() userData: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.update(id, userData);

    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  // UPDATE PROFILE
  @Throttle({ default: { limit: 5, ttl: 60000 } }) //for development only
  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  @Put('profile/:id')
  @UseInterceptors(FileInterceptor('avatarUrl'))
  async updateProfile(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.updateProfile(
      id,
      updateProfileDto,
      file,
    );

    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  // DELETE USER
  @Throttle({ default: { limit: 5, ttl: 60000 } }) //for development only
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.usersService.delete(id);
  }
}
