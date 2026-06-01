import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BookCopiesService } from './book-copies.service';
import { CreateBookCopyDto } from './dto/create-book-copy.dto';
import { UpdateBookCopyDto } from './dto/update-book-copy.dto';

@Controller('book-copies')
export class BookCopiesController {
  constructor(private readonly bookCopiesService: BookCopiesService) {}

  @Post()
  create(@Body() createBookCopyDto: CreateBookCopyDto) {
    return this.bookCopiesService.create(createBookCopyDto);
  }

  @Get()
  findAll() {
    return this.bookCopiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookCopiesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookCopyDto: UpdateBookCopyDto) {
    return this.bookCopiesService.update(+id, updateBookCopyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookCopiesService.remove(+id);
  }
}
