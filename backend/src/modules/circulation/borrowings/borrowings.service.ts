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
import { User } from '../../identity/users/entities/user.entity';
import { BookCopy } from '../book-copies/entities/book-copy.entity';
import { NotificationsService } from '../../core/notifications/notifications.service';

@Injectable()
export class BorrowingsService {
  private readonly logger = new Logger(BorrowingsService.name);

  constructor(
    @InjectRepository(Borrowing)
    private borrowingRepository: Repository<Borrowing>,
    @InjectDataSource() private dataSource: DataSource,
    private readonly notificationsService: NotificationsService,
  ) {}

  async selfBorrow(bookId: string, userId: string) {
    this.logger.log(
      `Self-borrow request | borrower=${userId} | book=${bookId}`,
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

      // 2. Find an available copy for this book
      const availableCopy = await bookCopyRepository.findOne({
        where: { bookId, status: BookCopyStatus.AVAILABLE },
        relations: { book: true },
      });

      if (!availableCopy) {
        throw new BadRequestException(
          'No available copies for this book at the moment.',
        );
      }

      // 3. Prevent borrowing the same book twice
      const alreadyBorrowing = await borrowingRepository
        .createQueryBuilder('b')
        .innerJoin('b.bookCopy', 'bc')
        .where('b.userId = :userId', { userId })
        .andWhere('bc.bookId = :bookId', { bookId })
        .andWhere('b.status IN (:...statuses)', {
          statuses: [BorrowingStatus.BORROWED, BorrowingStatus.PENDING],
        })
        .getOne();

      if (alreadyBorrowing) {
        throw new ConflictException(
          'You already have an active borrowing for this book.',
        );
      }

      // 4. Borrow limit validation (role-based)
      const activeBorrowingsCount = await borrowingRepository.count({
        where: { userId, status: BorrowingStatus.BORROWED },
      });

      let maxLimit = 5;
      if (borrower.role === Role.STUDENT) maxLimit = 3;
      else if (borrower.role === Role.FACULTY) maxLimit = 5;

      if (activeBorrowingsCount >= maxLimit) {
        throw new BadRequestException(
          `Borrow limit reached. You currently have ${activeBorrowingsCount}/${maxLimit} active borrowings.`,
        );
      }

      // 5. Create borrowing (14-day default)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const borrowing = borrowingRepository.create({
        userId,
        bookCopyId: availableCopy.id,
        borrowDate: new Date(),
        dueDate,
        status: BorrowingStatus.PENDING,
      });

      const saved = await borrowingRepository.save(borrowing);

      // 6. Update copy status to RESERVED to lock it while pending
      availableCopy.status = BookCopyStatus.RESERVED;
      await bookCopyRepository.save(availableCopy);

      // 7. Return complete entity
      const result = await borrowingRepository.findOne({
        where: { id: saved.id },
        relations: { user: true, bookCopy: { book: true } },
      });

      // 8. Send real-time notifications
      const bookTitle = availableCopy.book?.title || 'a book';

      await this.notificationsService.sendToUser(userId, {
        type: 'BORROW_PENDING',
        title: 'Borrow Request Pending',
        message: `Your request to borrow "${bookTitle}" is pending admin confirmation.`,
        data: { borrowingId: saved.id, bookId },
      });

      await this.notificationsService.sendToRole(Role.ADMIN, {
        type: 'NEW_BORROWING_REQUEST',
        title: 'New Borrowing Request',
        message: `${borrower.fullName} requested to borrow "${bookTitle}". Pending confirmation.`,
        data: { borrowingId: saved.id, userId, bookId },
      });

      return result;
    });
  }

  async confirmBorrowing(id: string) {
    return this.dataSource.transaction(async (manager) => {
      const borrowingRepository = manager.getRepository(Borrowing);
      const bookCopyRepository = manager.getRepository(BookCopy);

      const borrowing = await borrowingRepository.findOne({
        where: { id },
        relations: { user: true, bookCopy: { book: true } },
      });

      if (!borrowing) throw new NotFoundException('Borrowing record not found');
      if (borrowing.status !== BorrowingStatus.PENDING) {
        throw new BadRequestException('Borrowing is not in pending status');
      }

      // Update borrowing status
      borrowing.status = BorrowingStatus.BORROWED;

      // Update book copy status
      const copy = borrowing.bookCopy;
      if (copy) {
        copy.status = BookCopyStatus.BORROWED;
        await bookCopyRepository.save(copy);
      }

      await borrowingRepository.save(borrowing);

      // Notify user
      const bookTitle = copy?.book?.title || 'a book';
      const dueDateStr = borrowing.dueDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      await this.notificationsService.sendToUser(borrowing.userId, {
        type: 'BORROW_CONFIRMED',
        title: 'Borrow Request Confirmed',
        message: `Your request to borrow "${bookTitle}" has been confirmed by an admin. Due date: ${dueDateStr}.`,
        data: { borrowingId: id, bookId: copy?.bookId },
      });

      return borrowing;
    });
  }

  async rejectBorrowing(id: string) {
    return this.dataSource.transaction(async (manager) => {
      const borrowingRepository = manager.getRepository(Borrowing);
      const bookCopyRepository = manager.getRepository(BookCopy);

      const borrowing = await borrowingRepository.findOne({
        where: { id },
        relations: { user: true, bookCopy: { book: true } },
      });

      if (!borrowing) throw new NotFoundException('Borrowing record not found');
      if (borrowing.status !== BorrowingStatus.PENDING) {
        throw new BadRequestException('Borrowing is not in pending status');
      }

      // Update borrowing status
      borrowing.status = BorrowingStatus.REJECTED;

      // Update book copy status back to available
      const copy = borrowing.bookCopy;
      if (copy) {
        copy.status = BookCopyStatus.AVAILABLE;
        await bookCopyRepository.save(copy);
      }

      await borrowingRepository.save(borrowing);

      // Notify user
      const bookTitle = copy?.book?.title || 'a book';

      await this.notificationsService.sendToUser(borrowing.userId, {
        type: 'BORROW_REJECTED',
        title: 'Borrow Request Rejected',
        message: `Your request to borrow "${bookTitle}" was not approved by the admin.`,
        data: { borrowingId: id, bookId: copy?.bookId },
      });

      return borrowing;
    });
  }

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

      const result = await borrowingRepository.findOne({
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

      // Send real-time notifications
      const bookTitle = bookCopy.book?.title || 'a book';

      await this.notificationsService.sendToUser(userId!, {
        type: 'BORROW_CONFIRMED',
        title: 'Book Borrowed Successfully',
        message: `You have borrowed "${bookTitle}".`,
        data: { borrowingId: savedBorrowing.id },
      });

      await this.notificationsService.sendToRole(Role.ADMIN, {
        type: 'NEW_BORROWING',
        title: 'New Borrowing',
        message: `A student borrowed "${bookTitle}".`,
        data: { borrowingId: savedBorrowing.id, userId },
      });

      return result;
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

      // Send real-time notifications
      const bookTitles = bookCopies
        .map((c) => c.book?.title)
        .filter(Boolean)
        .join(', ');

      await this.notificationsService.sendToUser(userId, {
        type: 'BORROW_CONFIRMED',
        title: 'Books Borrowed Successfully',
        message: `You have borrowed ${bookCopyIds.length} book(s): ${bookTitles || 'multiple books'}.`,
        data: { borrowingIds: savedBorrowings.map((b) => b.id) },
      });

      await this.notificationsService.sendToRole(Role.ADMIN, {
        type: 'NEW_BORROWING',
        title: 'New Bulk Borrowing',
        message: `${borrower.fullName} borrowed ${bookCopyIds.length} book(s).`,
        data: { borrowingIds: savedBorrowings.map((b) => b.id), userId },
      });

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
