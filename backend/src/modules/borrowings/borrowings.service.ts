import { Injectable, Logger } from '@nestjs/common';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { UpdateBorrowingDto } from './dto/update-borrowing.dto';
import { DataSource, Repository } from 'typeorm';
import { Borrowing } from './entities/borrowing.entity';

@Injectable()
export class BorrowingsService {
  private readonly logger = new Logger(BorrowingsService.name);
  private borrowingRepository: Repository<Borrowing>;

  constructor(
    private readonly dataSource: DataSource,
  ) {
    this.borrowingRepository = this.dataSource.getRepository(Borrowing);
  }

  create(createBorrowingDto: CreateBorrowingDto) {
    this.logger.log('Creating borrowing', createBorrowingDto);
    return this.borrowingRepository.save(createBorrowingDto);
  }

  findAll() {
    this.logger.log('Finding all borrowings');
    return this.borrowingRepository.find({ relations: ['book', 'user'] });
  }

  findOne(id: string) {
    this.logger.log('Finding borrowing with id', id);
    return this.borrowingRepository.findOne({ where: { id }, relations: ['book', 'user'] });
  }

  update(id: string, updateBorrowingDto: UpdateBorrowingDto) {
    this.logger.log('Updating borrowing with id', id);
    return this.borrowingRepository.update(id, updateBorrowingDto);
  }

  remove(id: string) {
    this.logger.log('Removing borrowing with id', id);
    return this.borrowingRepository.delete(id);
  }
}
