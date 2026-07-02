import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Query,
  UseInterceptors,
  UploadedFile,
  Put,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guard/passport-auth.guard';
import { Role } from 'src/common/enums/role.enum';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('books')
@UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  // CREATE
  @Post()
  @UseInterceptors(FileInterceptor('coverImage'))
  @Roles(Role.ADMIN)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createBookDto: CreateBookDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.booksService.create(createBookDto, file);
  }

  // GET ALL
  @Get()
  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.booksService.findAll(pageNum, limitNum, search);
  }

  // GET ONE
  @Get(':id')
  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @Throttle({ default: { limit: 120, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.booksService.findOne(id);
  }

  // UPDATE
  @Put(':id')
  @UseInterceptors(FileInterceptor('coverImage'))
  @Roles(Role.ADMIN)
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateBookDto: UpdateBookDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.booksService.update(id, updateBookDto, file);
  }

  // DELETE
  @Delete(':id')
  @Roles(Role.ADMIN)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.booksService.remove(id);
  }
}
