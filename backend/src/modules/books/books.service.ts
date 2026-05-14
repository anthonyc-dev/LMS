import { Injectable, Logger } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';
import { DataSource, Repository } from 'typeorm';

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

  findAll() {
    this.logger.log('Finding all books');
    return this.bookRepository.find();
  }

  findOne(id: string) {
    this.logger.log('Finding book with id', id);
    return this.bookRepository.findOneBy({ id });
  }

  update(id: string, updateBookDto: UpdateBookDto) {
    this.logger.log('Updating book with id', id);
    return this.bookRepository.update(id, updateBookDto);
  }

  remove(id: string) {
    this.logger.log('Removing book with id', id);
    return this.bookRepository.delete(id);
  }
}
