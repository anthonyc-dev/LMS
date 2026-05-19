import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';
import { DataSource, Repository, ILike, FindManyOptions } from 'typeorm';

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  private bookRepository: Repository<Book>;

  constructor(
    private readonly dataSource: DataSource,
  ) {
    this.bookRepository = this.dataSource.getRepository(Book);
  }
  create(createBookDto: CreateBookDto) {
    this.logger.log('Creating book', createBookDto);
    return this.bookRepository.save(createBookDto);
  }

  async findAll(page = 1, limit = 10, search?: string) {
    this.logger.log(`Finding all books (page: ${page}, limit: ${limit}, search: ${search})`);

    const skip = (page - 1) * limit;
    const findOptions: FindManyOptions<Book> = {
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: {
        category: true,
      },
    };

    if (search && search.trim() !== '') {
      findOptions.where = [
        { title: ILike(`%${search}%`) },
        { author: ILike(`%${search}%`) },
        { isbn: ILike(`%${search}%`) },
        {
          category: {
            name: ILike(`%${search}%`),
          },
        },
      ];
    }

    const [data, total] = await this.bookRepository.findAndCount(findOptions);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  findOne(id: string) {
    this.logger.log('Finding book with id', id);
    return this.bookRepository.findOne({ where: { id }, relations: ['category'] });
  }

  async update(id: string, updateBookDto: UpdateBookDto) {
    this.logger.log('Updating book with id', id);
    const book = await this.findOne(id);
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return this.bookRepository.update(id, updateBookDto);
  }

  async remove(id: string) {
    this.logger.log('Removing book with id', id);
    const book = await this.findOne(id);
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return this.bookRepository.delete(id);
  }
}
