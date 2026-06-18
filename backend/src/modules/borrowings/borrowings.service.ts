import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { UpdateBorrowingDto } from './dto/update-borrowing.dto';
import { CreateBulkBorrowingDto } from './dto/create-bulk-borrowing.dto';
import { ReturnBorrowingDto } from './dto/return-borrowing.dto';
import { DataSource, Repository, In } from 'typeorm';
import { Borrowing } from './entities/borrowing.entity';
import { LessThan, Not } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  BookCopyStatus,
  BorrowingStatus,
  BookCondition,
} from 'src/common/enums/enum.enums';
import { Role } from 'src/common/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { BookCopy } from '../book-copies/entities/book-copy.entity';

@Injectable()
export class BorrowingsService {
  private readonly logger = new Logger(BorrowingsService.name);

  constructor(
    @InjectRepository(Borrowing)
    private borrowingRepository: Repository<Borrowing>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async create(createBorrowingDto: CreateBorrowingDto, processedById: string) {
    const { userId, bookCopyId, dueDate } = createBorrowingDto;

    this.logger.log(
      `Creating borrowing | borrower=${userId} | copy=${bookCopyId} | processedBy=${processedById}`,
    );

    return this.dataSource.transaction(async (manager) => {
      /*
     |--------------------------------------------------------------------------
     | Repositories
     |--------------------------------------------------------------------------
     */

      const borrowingRepository = manager.getRepository(Borrowing);
      const userRepository = manager.getRepository(User);
      const bookCopyRepository = manager.getRepository(BookCopy);

      /*
     |--------------------------------------------------------------------------
     | 1. Validate Borrower
     |--------------------------------------------------------------------------
     */

      const borrower = await userRepository.findOne({
        where: {
          id: userId,
        },
      });

      if (!borrower) {
        this.logger.warn(`Borrower not found: ${userId}`);

        throw new NotFoundException('Borrower not found');
      }

      /*
     |--------------------------------------------------------------------------
     | 2. Validate Book Copy
     |--------------------------------------------------------------------------
     */

      const bookCopy = await bookCopyRepository.findOne({
        where: {
          id: bookCopyId,
        },
        relations: {
          book: true,
        },
      });

      if (!bookCopy) {
        this.logger.warn(`Book copy not found: ${bookCopyId}`);

        throw new NotFoundException('Book copy not found');
      }

      /*
     |--------------------------------------------------------------------------
     | 3. Validate Availability
     |--------------------------------------------------------------------------
     */

      if (bookCopy.status !== BookCopyStatus.AVAILABLE) {
        throw new BadRequestException('Book copy is not available');
      }

      /*
     |--------------------------------------------------------------------------
     | 4. Prevent Duplicate Active Borrowing
     |--------------------------------------------------------------------------
     */

      const existingBorrowing = await borrowingRepository.findOne({
        where: {
          bookCopyId,
          status: BorrowingStatus.BORROWED,
        },
      });

      if (existingBorrowing) {
        throw new ConflictException('Book copy already borrowed');
      }

      /*
     |--------------------------------------------------------------------------
     | 5. Borrow Limit Validation
     |--------------------------------------------------------------------------
     */

      const activeBorrowingsCount = await borrowingRepository.count({
        where: {
          userId,
          status: BorrowingStatus.BORROWED,
        },
      });

      const MAX_BORROW_LIMIT = 5;

      if (activeBorrowingsCount >= MAX_BORROW_LIMIT) {
        throw new BadRequestException(
          `Borrow limit exceeded. Maximum allowed is ${MAX_BORROW_LIMIT}`,
        );
      }

      /*
     |--------------------------------------------------------------------------
     | 6. Create Borrowing
     |--------------------------------------------------------------------------
     */

      const borrowing = borrowingRepository.create({
        userId,
        bookCopyId,
        borrowDate: new Date(),
        dueDate: new Date(dueDate),
        status: BorrowingStatus.BORROWED,
      });

      const savedBorrowing = await borrowingRepository.save(borrowing);

      /*
     |--------------------------------------------------------------------------
     | 7. Update Book Copy Status
     |--------------------------------------------------------------------------
     */

      bookCopy.status = BookCopyStatus.BORROWED;

      await bookCopyRepository.save(bookCopy);

      /*
     |--------------------------------------------------------------------------
     | 8. Return Complete Entity
     |--------------------------------------------------------------------------
     */

      return borrowingRepository.findOne({
        where: {
          id: savedBorrowing.id,
        },
        relations: {
          user: true,
          bookCopy: {
            book: true,
          },
        },
      });
    });
  }

  async createBulk(
    createBulkBorrowingDto: CreateBulkBorrowingDto,
    processedById: string,
  ) {
    const { userId, bookCopyIds, dueDate } = createBulkBorrowingDto;

    this.logger.log(
      `Creating bulk borrowing | borrower=${userId} | copies=${bookCopyIds.length} | processedBy=${processedById}`,
    );

    return this.dataSource.transaction(async (manager) => {
      const borrowingRepository = manager.getRepository(Borrowing);
      const userRepository = manager.getRepository(User);
      const bookCopyRepository = manager.getRepository(BookCopy);

      // 1. Validate Borrower
      const borrower = await userRepository.findOne({ where: { id: userId } });
      if (!borrower) {
        throw new NotFoundException('Borrower not found');
      }

      // 2. Validate Book Copies
      const bookCopies = await bookCopyRepository.find({
        where: { id: In(bookCopyIds) },
        relations: { book: true },
      });

      if (bookCopies.length !== bookCopyIds.length) {
        throw new NotFoundException('One or more book copies not found');
      }

      // 3. Validate Availability
      const unavailableCopy = bookCopies.find(
        (copy) => copy.status !== BookCopyStatus.AVAILABLE,
      );
      if (unavailableCopy) {
        throw new BadRequestException(
          `Book copy ${unavailableCopy.barcode || unavailableCopy.id} is not available`,
        );
      }

      // 4. Check Limits
      const activeBorrowingsCount = await borrowingRepository.count({
        where: {
          userId,
          status: BorrowingStatus.BORROWED,
        },
      });

      // Fetch user role based limit
      let MAX_BORROW_LIMIT = 5;
      if (borrower.role === Role.STUDENT) MAX_BORROW_LIMIT = 3;
      else if (borrower.role === Role.FACULTY) MAX_BORROW_LIMIT = 5;
      else if (borrower.role === Role.ADMIN) MAX_BORROW_LIMIT = 10;

      if (activeBorrowingsCount + bookCopyIds.length > MAX_BORROW_LIMIT) {
        throw new BadRequestException(
          `Borrow limit exceeded. Active: ${activeBorrowingsCount}, Requesting: ${bookCopyIds.length}, Max: ${MAX_BORROW_LIMIT}`,
        );
      }

      // 5. Create Borrowings
      const newBorrowings = bookCopyIds.map((bookCopyId) => {
        return borrowingRepository.create({
          userId,
          bookCopyId,
          borrowDate: new Date(),
          dueDate: new Date(dueDate),
          status: BorrowingStatus.BORROWED,
        });
      });

      const savedBorrowings = await borrowingRepository.save(newBorrowings);

      // 6. Update Book Copy Status
      for (const copy of bookCopies) {
        copy.status = BookCopyStatus.BORROWED;
      }
      await bookCopyRepository.save(bookCopies);

      return savedBorrowings;
    });
  }

  findAll() {
    this.logger.log('Finding all borrowings');
    return this.borrowingRepository.find({
      relations: {
        user: true,
        bookCopy: {
          book: true,
        },
        fines: true,
      },
    });
  }

  findOne(id: string) {
    this.logger.log('Finding borrowing with id', id);
    return this.borrowingRepository.findOne({
      where: { id },
      relations: {
        user: true,
        bookCopy: {
          book: true,
        },
        fines: true,
      },
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
      relations: {
        user: true,
        bookCopy: {
          book: true,
        },
        fines: true,
      },
      order: { returnedDate: 'DESC' },
    });
  }

  findByUser(userId: string) {
    this.logger.log(`Finding borrowings for user ${userId}`);
    return this.borrowingRepository.find({
      where: { userId },
      relations: {
        user: true,
        bookCopy: {
          book: true,
        },
        fines: true,
      },
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
      relations: {
        user: true,
        bookCopy: {
          book: true,
        },
        fines: true,
      },
      order: { dueDate: 'ASC' },
    });
  }

  async returnBorrowing(id: string, returnDto?: ReturnBorrowingDto) {
    this.logger.log(`Returning borrowing with id ${id}`);

    return this.dataSource.transaction(async (manager) => {
      const borrowingRepository = manager.getRepository(Borrowing);
      const bookCopyRepository = manager.getRepository(BookCopy);

      const borrowing = await borrowingRepository.findOne({
        where: { id },
        relations: { bookCopy: true },
      });

      if (!borrowing) {
        throw new NotFoundException(`Borrowing with ID ${id} not found`);
      }

      // Update Borrowing Record
      borrowing.status = BorrowingStatus.RETURNED;
      borrowing.returnedDate = new Date();
      await borrowingRepository.save(borrowing);

      // Update Book Copy Status
      if (borrowing.bookCopy) {
        if (returnDto?.condition) {
          borrowing.bookCopy.condition = returnDto.condition;
          if (
            returnDto.condition === BookCondition.DAMAGED ||
            returnDto.condition === BookCondition.POOR
          ) {
            borrowing.bookCopy.status = BookCopyStatus.DAMAGED;
          } else {
            borrowing.bookCopy.status = BookCopyStatus.AVAILABLE;
          }
        } else {
          borrowing.bookCopy.status = BookCopyStatus.AVAILABLE;
        }

        await bookCopyRepository.save(borrowing.bookCopy);
      }

      return borrowing;
    });
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
