import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
@Throttle({ default: { limit: 5, ttl: 60000 } }) //for development only
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // CREATE USER
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() userData: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.create(userData);

    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  // GET USER BY ID
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<User | null> {
    return this.usersService.findById(id);
  }

  // GET USER BY EMAIL
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get('email/:email')
  findByEmail(@Param('email') email: string): Promise<User | null> {
    return this.usersService.findByEmail(email);
  }

  // UPDATE USER
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() userData: UpdateUserDto,
  ): Promise<User | null> {
    return this.usersService.update(id, userData);
  }

  // DELETE USER
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.usersService.delete(id);
  }
}
