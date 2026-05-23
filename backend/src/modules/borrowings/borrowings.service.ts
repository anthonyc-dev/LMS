import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { UpdateBorrowingDto } from './dto/update-borrowing.dto';
import { Repository } from 'typeorm';
import { Borrowing, BorrowingStatus } from './entities/borrowing.entity';
import { LessThan, Not } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BorrowingsService {
  private readonly logger = new Logger(BorrowingsService.name);

  constructor(
    @InjectRepository(Borrowing)
    private borrowingRepository: Repository<Borrowing>,
  ) {}

  create(createBorrowingDto: CreateBorrowingDto, userId: string) {
    this.logger.log('Creating borrowing', { ...createBorrowingDto, userId });
    return this.borrowingRepository.save({
      ...createBorrowingDto,
      userId,
    });
  }

  findAll() {
    this.logger.log('Finding all borrowings');
    return this.borrowingRepository.find({ relations: ['book', 'user'] });
  }

  findOne(id: string) {
    this.logger.log('Finding borrowing with id', id);
    return this.borrowingRepository.findOne({
      where: { id },
      relations: ['book', 'user'],
    });
  }

  update(id: string, updateBorrowingDto: UpdateBorrowingDto) {
    this.logger.log('Updating borrowing with id', id);
    return this.borrowingRepository.update(id, updateBorrowingDto);
  }

  remove(id: string) {
    this.logger.log('Removing borrowing with id', id);
    return this.borrowingRepository.delete(id);
  }

  findHistory() {
    this.logger.log('Finding borrowing history');
    return this.borrowingRepository.find({
      where: { status: BorrowingStatus.RETURNED },
      relations: ['book', 'user'],
      order: { returnedDate: 'DESC' },
    });
  }

  findByUser(userId: string) {
    this.logger.log(`Finding borrowings for user ${userId}`);
    return this.borrowingRepository.find({
      where: { userId },
      relations: ['book', 'user'],
      order: { borrowDate: 'DESC' },
    });
  }

  findOverdue() {
    this.logger.log('Finding overdue borrowings');
    return this.borrowingRepository.find({
      where: [
        { status: BorrowingStatus.OVERDUE },
        {
          status: Not(BorrowingStatus.RETURNED),
          dueDate: LessThan(new Date()),
        },
      ],
      relations: ['book', 'user'],
      order: { dueDate: 'ASC' },
    });
  }

  async returnBorrowing(id: string) {
    this.logger.log(`Returning borrowing with id ${id}`);
    const borrowing = await this.borrowingRepository.findOne({ where: { id } });
    if (!borrowing) {
      throw new NotFoundException(`Borrowing with ID ${id} not found`);
    }

    borrowing.status = BorrowingStatus.RETURNED;
    borrowing.returnedDate = new Date();

    return this.borrowingRepository.save(borrowing);
  }

  async extendBorrowing(id: string) {
    this.logger.log(`Extending borrowing with id ${id}`);
    const borrowing = await this.borrowingRepository.findOne({ where: { id } });
    if (!borrowing) {
      throw new NotFoundException(`Borrowing with ID ${id} not found`);
    }

    if (borrowing.status === BorrowingStatus.RETURNED) {
      throw new Error('Cannot extend a returned book');
    }

    // Extend due date by 7 days
    const currentDueDate = new Date(borrowing.dueDate);
    currentDueDate.setDate(currentDueDate.getDate() + 7);

    borrowing.dueDate = currentDueDate;
    borrowing.extendedCount = (borrowing.extendedCount || 0) + 1;

    return this.borrowingRepository.save(borrowing);
  }
}
