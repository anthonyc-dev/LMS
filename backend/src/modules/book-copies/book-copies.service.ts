import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookCopyDto } from './dto/create-book-copy.dto';
import { UpdateBookCopyDto } from './dto/update-book-copy.dto';
import { BookCopy, BookCopyStatus } from './entities/book-copy.entity';
import * as bwipjs from 'bwip-js';

@Injectable()
export class BookCopiesService {
  constructor(
    @InjectRepository(BookCopy)
    private readonly bookCopyRepository: Repository<BookCopy>,
  ) {}

  async create(createBookCopyDto: CreateBookCopyDto): Promise<BookCopy> {
    let barcode = '';
    let isUnique = false;

    while (!isUnique) {
      barcode =
        'BC' +
        Math.floor(Math.random() * 10000000000)
          .toString()
          .padStart(10, '0');
      const existing = await this.bookCopyRepository.findOne({
        where: { barcode },
      });
      if (!existing) {
        isUnique = true;
      }
    }

    const bookCopy = this.bookCopyRepository.create({
      ...createBookCopyDto,
      barcode,
      status: BookCopyStatus.AVAILABLE,
      acquiredAt: new Date(),
    });
    return await this.bookCopyRepository.save(bookCopy);
  }

  async findAll(): Promise<BookCopy[]> {
    const bookCopies = await this.bookCopyRepository.find({
      relations: { book: true, shelf: true },
    });
    return bookCopies;
  }

  async findOne(id: string): Promise<BookCopy> {
    const bookCopy = await this.bookCopyRepository.findOne({
      where: { id },
      relations: { book: true, shelf: true },
    });
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
    Object.assign(bookCopy, updateBookCopyDto);
    return await this.bookCopyRepository.save(bookCopy);
  }

  async remove(id: string): Promise<void> {
    const bookCopy = await this.findOne(id);
    await this.bookCopyRepository.softRemove(bookCopy);
  }

  async getBarcodeImage(id: string): Promise<Buffer> {
    const bookCopy = await this.findOne(id);
    const png = await bwipjs.toBuffer({
      bcid: 'code128',
      text: bookCopy.barcode,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center',
    });
    return png;
  }
}
