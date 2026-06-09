import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookCopyDto } from './dto/create-book-copy.dto';
import { BulkCreateBookCopyDto } from './dto/bulk-create-book-copy.dto';
import { UpdateBookCopyDto } from './dto/update-book-copy.dto';
import { BookCopy } from './entities/book-copy.entity';
import * as bwipjs from 'bwip-js';
import { BookCopyStatus } from 'src/common/enums/enum.enums';
import { BookCopyMapper } from './mapper/book-copy.mapper';

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
      acquiredAt: new Date(),
    });
    const saved = await this.bookCopyRepository.save(bookCopy);
    return await this.findOne(saved.id);
  }

  async bulkCreate(bulkDto: BulkCreateBookCopyDto): Promise<BookCopy[]> {
    const { count, ...createDto } = bulkDto;
    const copies: BookCopy[] = [];

    // Create multiple copies iteratively
    for (let i = 0; i < count; i++) {
      const copy = await this.create(createDto);
      copies.push(copy);
    }

    return copies;
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    status?: BookCopyStatus,
  ) {
    const skip = (page - 1) * limit;

    const query = this.bookCopyRepository
      .createQueryBuilder('bookCopy')
      .leftJoinAndSelect('bookCopy.book', 'book')
      .leftJoinAndSelect('bookCopy.shelfSection', 'shelfSection')
      .leftJoinAndSelect('shelfSection.shelf', 'shelf')
      .skip(skip)
      .take(limit)
      .orderBy('bookCopy.createdAt', 'DESC');

    if (search?.trim()) {
      query.andWhere(
        `(bookCopy.barcode ILIKE :search OR book.title ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    if (status) {
      query.andWhere('bookCopy.status = :status', { status });
    }

    const [data, total] = await query.getManyAndCount();

    return {
      data: BookCopyMapper.toResponseList(data),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByBarcode(barcode: string): Promise<BookCopy> {
    const bookCopy = await this.bookCopyRepository.findOne({
      where: { barcode },
      relations: {
        book: true,
        shelfSection: {
          shelf: true,
        },
      },
    });

    if (!bookCopy) {
      throw new NotFoundException(
        `Book copy with barcode ${barcode} not found`,
      );
    }

    return bookCopy;
  }

  async findOne(id: string): Promise<BookCopy> {
    const bookCopy = await this.bookCopyRepository.findOne({
      where: { id },
      relations: {
        book: true,
        shelfSection: {
          shelf: true,
        },
      },
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
