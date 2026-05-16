import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import type { RequestWithUser } from 'src/common/guard/auth.guard';
import { BorrowingsService } from './borrowings.service';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { UpdateBorrowingDto } from './dto/update-borrowing.dto';
import { JwtAuthGuard } from 'src/common/guard/passport-auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Throttle } from '@nestjs/throttler';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UseGuards } from '@nestjs/common';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { HttpCode } from '@nestjs/common';

@Controller('borrowings')
@UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
@Throttle({ default: { limit: 5, ttl: 60000 } }) //for development only
export class BorrowingsController {
  constructor(private readonly borrowingsService: BorrowingsService) { }

  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() createBorrowingDto: CreateBorrowingDto, @Req() req: RequestWithUser) {
    const userId = req.user.sub;
    return this.borrowingsService.create(createBorrowingDto, userId);
  }

  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  @Get('history')
  findHistory() {
    return this.borrowingsService.findHistory();
  }

  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  @Get('overdue')
  findOverdue() {
    return this.borrowingsService.findOverdue();
  }

  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  @Get('user/:userId')
  findByUser(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.borrowingsService.findByUser(userId);
  }

  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  @Get()
  findAll() {
    return this.borrowingsService.findAll();
  }

  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.borrowingsService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() updateBorrowingDto: UpdateBorrowingDto) {
    return this.borrowingsService.update(id, updateBorrowingDto);
  }

  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.borrowingsService.remove(id);
  }

  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/return')
  returnBorrowing(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.borrowingsService.returnBorrowing(id);
  }

  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/extend')
  extendBorrowing(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.borrowingsService.extendBorrowing(id);
  }
}
