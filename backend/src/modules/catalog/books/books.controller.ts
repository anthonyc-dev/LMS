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
  Header,
} from '@nestjs/common';
import { ListBooksQueryDto } from './dto/list-books-query.dto';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guard/passport-auth.guard';
import { Role } from 'src/common/enums/role.enum';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Throttle } from '@nestjs/throttler';
import { PDF_MAX_BYTES } from 'src/common/utils/cloudinaryPdf';
import { ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';
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
  findAll(@Query() query: ListBooksQueryDto) {
    return this.booksService.findAll(
      query.page,
      query.limit,
      query.search,
      query.format,
      query.categoryId,
    );
  }

  // GET ONE
  @Get(':id')
  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @Throttle({ default: { limit: 120, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.booksService.findOne(id);
  }

  @Post(':id/ebook')
  @Roles(Role.ADMIN)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseInterceptors(
    FileInterceptor('pdf', {
      limits: { fileSize: PDF_MAX_BYTES, files: 1, fields: 0 },
    }),
  )
  @ApiOperation({ summary: 'Upload or replace the book PDF (maximum 10 MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['pdf'],
      properties: { pdf: { type: 'string', format: 'binary' } },
    },
  })
  uploadEbook(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.booksService.uploadEbook(id, file);
  }

  @Get(':id/ebook')
  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Get a temporary PDF reading URL (15 minutes)' })
  readEbook(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.booksService.readEbook(id);
  }

  @Delete(':id/ebook')
  @Roles(Role.ADMIN)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  removeEbook(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.booksService.removeEbook(id);
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
