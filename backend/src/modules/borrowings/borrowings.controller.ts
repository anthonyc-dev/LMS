import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import type { RequestWithUser } from 'src/common/guard/auth.guard';
import { BorrowingsService } from './borrowings.service';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { CreateBulkBorrowingDto } from './dto/create-bulk-borrowing.dto';
import { UpdateBorrowingDto } from './dto/update-borrowing.dto';
import { ReturnBorrowingDto } from './dto/return-borrowing.dto';
import { JwtAuthGuard } from 'src/common/guard/passport-auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Throttle } from '@nestjs/throttler';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UseGuards } from '@nestjs/common';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { HttpStatus, ParseUUIDPipe, BadRequestException } from '@nestjs/common';
import { HttpCode } from '@nestjs/common';

@Controller('borrowings')
export class BorrowingsController {
  constructor(private readonly borrowingsService: BorrowingsService) {}

  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) //for development only
  @Post()
  create(
    @Body() createBorrowingDto: CreateBorrowingDto,
    @Req() req: RequestWithUser,
  ) {
    // The librarian/operator is making the request, but we must
    // attach the borrowing to the student whose ID is passed in the DTO.
    if (!createBorrowingDto.userId) {
      throw new BadRequestException(
        'userId (borrower ID) is required to create a borrowing record.',
      );
    }

    return this.borrowingsService.create(createBorrowingDto, req.user.sub);
  }

  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('bulk')
  createBulk(
    @Body() createBulkBorrowingDto: CreateBulkBorrowingDto,
    @Req() req: RequestWithUser,
  ) {
    if (!createBulkBorrowingDto.userId) {
      throw new BadRequestException(
        'userId (borrower ID) is required to create a bulk borrowing record.',
      );
    }

    return this.borrowingsService.createBulk(
      createBulkBorrowingDto,
      req.user.sub,
    );
  }

  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @Get('history')
  findHistory() {
    return this.borrowingsService.findHistory();
  }

  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @Get('overdue')
  findOverdue() {
    return this.borrowingsService.findOverdue();
  }

  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Get('user/:userId')
  findByUser(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.borrowingsService.findByUser(userId);
  }

  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @Get()
  findAll() {
    return this.borrowingsService.findAll();
  }

  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.borrowingsService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateBorrowingDto: UpdateBorrowingDto,
  ) {
    return this.borrowingsService.update(id, updateBorrowingDto);
  }

  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.borrowingsService.remove(id);
  }

  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Patch(':id/return')
  returnBorrowing(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() returnBorrowingDto: ReturnBorrowingDto,
  ) {
    return this.borrowingsService.returnBorrowing(id, returnBorrowingDto);
  }

  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Patch(':id/extend')
  extendBorrowing(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.borrowingsService.extendBorrowing(id);
  }
}
