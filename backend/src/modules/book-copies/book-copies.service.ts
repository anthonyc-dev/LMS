import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookCopyDto } from './dto/create-book-copy.dto';
import { UpdateBookCopyDto } from './dto/update-book-copy.dto';
import { BookCopy } from './entities/book-copy.entity';

@Injectable()
export class BookCopiesService {
  constructor(
    @InjectRepository(BookCopy)
    private readonly bookCopyRepository: Repository<BookCopy>,
  ) {}

  async create(createBookCopyDto: CreateBookCopyDto): Promise<BookCopy> {
    const existingCopy = await this.bookCopyRepository.findOne({
      where: { barcode: createBookCopyDto.barcode },
    });

    if (existingCopy) {
      throw new ConflictException(
        `Book copy with barcode ${createBookCopyDto.barcode} already exists`,
      );
    }

    const bookCopy = this.bookCopyRepository.create(createBookCopyDto);
    return await this.bookCopyRepository.save(bookCopy);
  }

  async findAll(): Promise<BookCopy[]> {
    return await this.bookCopyRepository.find();
  }

  async findOne(id: string): Promise<BookCopy> {
    const bookCopy = await this.bookCopyRepository.findOne({ where: { id } });
    if (!bookCopy) {
      throw new NotFoundException(`Book copy with ID ${id} not found`);
    }
    return bookCopy;
  }

  async update(
    id: string,
    updateBookCopyDto: UpdateBookCopyDto,
  ): Promise<BookCopy> {
    const bookCopy = await this.findOne(id);

    if (
      updateBookCopyDto.barcode &&
      updateBookCopyDto.barcode !== bookCopy.barcode
    ) {
      const existingCopy = await this.bookCopyRepository.findOne({
        where: { barcode: updateBookCopyDto.barcode },
      });
      if (existingCopy) {
        throw new ConflictException(
          `Book copy with barcode ${updateBookCopyDto.barcode} already exists`,
        );
      }
    }

    Object.assign(bookCopy, updateBookCopyDto);
    return await this.bookCopyRepository.save(bookCopy);
  }

  async remove(id: string): Promise<void> {
    const bookCopy = await this.findOne(id);
    await this.bookCopyRepository.softRemove(bookCopy);
  }
}
