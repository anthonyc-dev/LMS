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
import { DataSource, EntityManager, Repository, In } from 'typeorm';
import { Borrowing } from './entities/borrowing.entity';
import { LessThan } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  BookCopyStatus,
  BorrowingStatus,
  BookCondition,
} from 'src/common/enums/enum.enums';
import { Role } from 'src/common/enums/role.enum';
import { User } from '../../identity/users/entities/user.entity';
import { BookCopy } from '../book-copies/entities/book-copy.entity';
import {
  NotificationsService,
  NotificationTransaction,
} from '../../core/notifications/notifications.service';
import { MailService, escapeEmailHtml } from '../../core/mail/mail.service';

@Injectable()
export class BorrowingsService {
  private readonly logger = new Logger(BorrowingsService.name);

  constructor(
    @InjectRepository(Borrowing)
    private borrowingRepository: Repository<Borrowing>,
    @InjectDataSource() private dataSource: DataSource,
    private readonly notificationsService: NotificationsService,
    private readonly mailService: MailService,
  ) {}

  private async withNotificationsTransaction<T>(
    action: (
      manager: EntityManager,
      notifications: NotificationTransaction,
    ) => Promise<T>,
  ): Promise<T> {
    let notifications: NotificationTransaction | undefined;
    const result = await this.dataSource.transaction(async (manager) => {
      notifications = { manager, pending: [] };
      return action(manager, notifications);
    });
    this.notificationsService.publishCommitted(notifications!);
    return result;
  }

  async selfBorrow(bookId: string, userId: string) {
    this.logger.log(`Self-borrow | borrower=${userId} | book=${bookId}`);

    return this.withNotificationsTransaction(
      async (manager, notificationTransaction) => {
        const borrowingRepository = manager.getRepository(Borrowing);
        const userRepository = manager.getRepository(User);
        const bookCopyRepository = manager.getRepository(BookCopy);

        // 1. Validate Borrower
        const borrower = await userRepository.findOne({
          where: { id: userId },
          lock: { mode: 'pessimistic_write' },
        });
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
            statuses: [
              BorrowingStatus.BORROWED,
              BorrowingStatus.PENDING,
              BorrowingStatus.OVERDUE,
            ],
          })
          .getOne();

        if (alreadyBorrowing) {
          throw new ConflictException(
            'You already have an active borrowing for this book.',
          );
        }

        // 4. Borrow limit validation (role-based)
        const activeBorrowingsCount = await borrowingRepository.count({
          where: {
            userId,
            status: In([
              BorrowingStatus.BORROWED,
              BorrowingStatus.PENDING,
              BorrowingStatus.OVERDUE,
            ]),
          },
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

        // Conditional claim serializes competing borrowers without locking joined tables.
        const claim = await bookCopyRepository.update(
          { id: availableCopy.id, status: BookCopyStatus.AVAILABLE },
          { status: BookCopyStatus.RESERVED },
        );
        if (!claim.affected)
          throw new ConflictException('Book copy is no longer available');

        // 7. Return complete entity
        const result = await borrowingRepository.findOne({
          where: { id: saved.id },
          relations: { user: true, bookCopy: { book: true } },
        });

        // 8. Send real-time notifications
        const bookTitle = availableCopy.book?.title || 'a book';

        await this.mailService.queue(manager, {
          to: borrower.email,
          subject: 'Library borrow request received',
          html:
            '<p>Your request to borrow &quot;' +
            escapeEmailHtml(bookTitle) +
            '&quot; is awaiting admin approval. Your 14-day loan starts when approved.</p>',
        });
        await this.notificationsService.sendToUser(
          userId,
          {
            type: 'BORROW_REQUESTED',
            title: 'Borrow Request Pending',
            message: `Your request to borrow "${bookTitle}" is awaiting admin approval.`,
            data: { borrowingId: saved.id, bookId },
          },
          notificationTransaction,
        );

        await this.notificationsService.sendToRole(
          Role.ADMIN,
          {
            type: 'BORROW_REQUESTED',
            title: 'Borrow Request',
            message: 'A book borrowing request needs approval.',
            data: { borrowingId: saved.id, bookId },
          },
          notificationTransaction,
        );
        return result;
      },
    );
  }

  async confirmBorrowing(id: string) {
    return this.withNotificationsTransaction(
      async (manager, notificationTransaction) => {
        const borrowingRepository = manager.getRepository(Borrowing);
        const bookCopyRepository = manager.getRepository(BookCopy);

        const borrowing = await borrowingRepository.findOne({
          where: { id },
          lock: { mode: 'pessimistic_write', tables: ['Borrowing'] },
          relations: { user: true, bookCopy: { book: true } },
        });

        if (!borrowing)
          throw new NotFoundException('Borrowing record not found');
        if (borrowing.status !== BorrowingStatus.PENDING) {
          throw new BadRequestException('Borrowing is not in pending status');
        }

        if (!borrowing.user)
          throw new BadRequestException('Borrower is no longer active');
        borrowing.status = BorrowingStatus.BORROWED;
        borrowing.borrowDate = new Date();
        borrowing.dueDate = new Date(
          borrowing.borrowDate.getTime() + 14 * 86400000,
        );

        // Update book copy status
        const copy = borrowing.bookCopy;
        if (!copy) throw new NotFoundException('Book copy not found');
        const claim = await bookCopyRepository.update(
          { id: copy.id, status: BookCopyStatus.RESERVED },
          { status: BookCopyStatus.BORROWED },
        );
        if (!claim.affected)
          throw new ConflictException('Book copy is no longer reserved');
        copy.status = BookCopyStatus.BORROWED;

        await borrowingRepository.save(borrowing);

        // Notify user
        const bookTitle = copy?.book?.title || 'a book';
        const dueDateStr = borrowing.dueDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

        await this.mailService.queue(manager, {
          to: borrowing.user.email,
          subject: 'Library borrow request confirmed',
          html:
            '<p>Your request to borrow &quot;' +
            escapeEmailHtml(bookTitle) +
            '&quot; was confirmed. Due date: ' +
            escapeEmailHtml(dueDateStr) +
            '.</p>',
        });
        await this.notificationsService.sendToUser(
          borrowing.userId,
          {
            type: 'BORROW_CONFIRMED',
            title: 'Borrow Request Confirmed',
            message: `Your request to borrow "${bookTitle}" has been confirmed by an admin. Due date: ${dueDateStr}.`,
            data: { borrowingId: id, bookId: copy?.bookId },
          },
          notificationTransaction,
        );

        return borrowing;
      },
    );
  }

  async rejectBorrowing(id: string) {
    return this.withNotificationsTransaction(
      async (manager, notificationTransaction) => {
        const borrowingRepository = manager.getRepository(Borrowing);
        const bookCopyRepository = manager.getRepository(BookCopy);

        const borrowing = await borrowingRepository.findOne({
          where: { id },
          lock: { mode: 'pessimistic_write', tables: ['Borrowing'] },
          relations: { user: true, bookCopy: { book: true } },
        });

        if (!borrowing)
          throw new NotFoundException('Borrowing record not found');
        if (borrowing.status !== BorrowingStatus.PENDING) {
          throw new BadRequestException('Borrowing is not in pending status');
        }

        // Update borrowing status
        borrowing.status = BorrowingStatus.REJECTED;

        // Update book copy status back to available
        const copy = borrowing.bookCopy;
        if (!copy) throw new NotFoundException('Book copy not found');
        const release = await bookCopyRepository.update(
          { id: copy.id, status: BookCopyStatus.RESERVED },
          { status: BookCopyStatus.AVAILABLE },
        );
        if (!release.affected)
          throw new ConflictException('Book copy is no longer reserved');
        copy.status = BookCopyStatus.AVAILABLE;

        await borrowingRepository.save(borrowing);

        // Notify user
        const bookTitle = copy?.book?.title || 'a book';

        await this.mailService.queue(manager, {
          to: borrowing.user.email,
          subject: 'Library borrow request declined',
          html:
            '<p>Your request to borrow &quot;' +
            escapeEmailHtml(bookTitle) +
            '&quot; was declined by the library.</p>',
        });
        await this.notificationsService.sendToUser(
          borrowing.userId,
          {
            type: 'BORROW_REJECTED',
            title: 'Borrow Request Rejected',
            message: `Your request to borrow "${bookTitle}" was not approved by the admin.`,
            data: { borrowingId: id, bookId: copy?.bookId },
          },
          notificationTransaction,
        );

        return borrowing;
      },
    );
  }

  async create(createBorrowingDto: CreateBorrowingDto, processedById: string) {
    const { userId, bookCopyId, dueDate } = createBorrowingDto;

    this.logger.log(
      `Creating borrowing | borrower=${userId} | copy=${bookCopyId} | processedBy=${processedById}`,
    );

    return this.withNotificationsTransaction(
      async (manager, notificationTransaction) => {
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
          lock: { mode: 'pessimistic_write' },
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
            status: In([
              BorrowingStatus.BORROWED,
              BorrowingStatus.PENDING,
              BorrowingStatus.OVERDUE,
            ]),
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

        const claim = await bookCopyRepository.update(
          { id: bookCopyId, status: BookCopyStatus.AVAILABLE },
          { status: BookCopyStatus.BORROWED },
        );
        if (!claim.affected)
          throw new ConflictException('Book copy is no longer available');
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

        await this.mailService.queue(manager, {
          to: borrower.email,
          subject: 'Library book borrowed',
          html:
            '<p>You borrowed &quot;' +
            escapeEmailHtml(bookTitle) +
            '&quot;. Due date: ' +
            escapeEmailHtml(borrowing.dueDate.toISOString().slice(0, 10)) +
            '.</p>',
        });
        await this.notificationsService.sendToUser(
          userId!,
          {
            type: 'BORROW_CONFIRMED',
            title: 'Book Borrowed Successfully',
            message: `You have borrowed "${bookTitle}".`,
            data: { borrowingId: savedBorrowing.id },
          },
          notificationTransaction,
        );

        await this.notificationsService.sendToRole(
          Role.ADMIN,
          {
            type: 'NEW_BORROWING',
            title: 'New Borrowing',
            message: `A student borrowed "${bookTitle}".`,
            data: { borrowingId: savedBorrowing.id, userId },
          },
          notificationTransaction,
        );

        return result;
      },
    );
  }

  async createBulk(
    createBulkBorrowingDto: CreateBulkBorrowingDto,
    processedById: string,
  ) {
    const { userId, bookCopyIds, dueDate } = createBulkBorrowingDto;

    this.logger.log(
      `Creating bulk borrowing | borrower=${userId} | copies=${bookCopyIds.length} | processedBy=${processedById}`,
    );

    return this.withNotificationsTransaction(
      async (manager, notificationTransaction) => {
        const borrowingRepository = manager.getRepository(Borrowing);
        const userRepository = manager.getRepository(User);
        const bookCopyRepository = manager.getRepository(BookCopy);

        // 1. Validate Borrower
        const borrower = await userRepository.findOne({
          where: { id: userId },
          lock: { mode: 'pessimistic_write' },
        });
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
            status: In([
              BorrowingStatus.BORROWED,
              BorrowingStatus.PENDING,
              BorrowingStatus.OVERDUE,
            ]),
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

        const claim = await bookCopyRepository.update(
          { id: In(bookCopyIds), status: BookCopyStatus.AVAILABLE },
          { status: BookCopyStatus.BORROWED },
        );
        if (claim.affected !== bookCopyIds.length)
          throw new ConflictException(
            'One or more copies are no longer available',
          );

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

        await this.mailService.queue(manager, {
          to: borrower.email,
          subject: 'Library books borrowed',
          html:
            '<p>You borrowed: ' +
            escapeEmailHtml(bookTitles) +
            '. Due date: ' +
            escapeEmailHtml(new Date(dueDate).toISOString().slice(0, 10)) +
            '.</p>',
        });
        await this.notificationsService.sendToUser(
          userId,
          {
            type: 'BORROW_CONFIRMED',
            title: 'Books Borrowed Successfully',
            message: `You have borrowed ${bookCopyIds.length} book(s): ${bookTitles || 'multiple books'}.`,
            data: { borrowingIds: savedBorrowings.map((b) => b.id) },
          },
          notificationTransaction,
        );

        await this.notificationsService.sendToRole(
          Role.ADMIN,
          {
            type: 'NEW_BORROWING',
            title: 'New Bulk Borrowing',
            message: `${borrower.fullName} borrowed ${bookCopyIds.length} book(s).`,
            data: { borrowingIds: savedBorrowings.map((b) => b.id), userId },
          },
          notificationTransaction,
        );

        return savedBorrowings;
      },
    );
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

  async update(id: string, updateBorrowingDto: UpdateBorrowingDto) {
    return this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(Borrowing);
      const borrowing = await repository.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!borrowing) throw new NotFoundException('Borrowing record not found');
      if (
        borrowing.status === BorrowingStatus.PENDING ||
        updateBorrowingDto.status === BorrowingStatus.PENDING
      ) {
        throw new BadRequestException(
          'Use approval or rejection for pending requests',
        );
      }
      return repository.update(id, updateBorrowingDto);
    });
  }

  async remove(id: string) {
    return this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(Borrowing);
      const borrowing = await repository.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!borrowing) throw new NotFoundException('Borrowing record not found');
      if (borrowing.status === BorrowingStatus.PENDING) {
        throw new BadRequestException(
          'Reject the pending request before deleting it',
        );
      }
      return repository.delete(id);
    });
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
          status: BorrowingStatus.BORROWED,
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

    return this.withNotificationsTransaction(async (manager) => {
      const borrowingRepository = manager.getRepository(Borrowing);
      const bookCopyRepository = manager.getRepository(BookCopy);

      const borrowing = await borrowingRepository.findOne({
        where: { id },
        relations: { bookCopy: true },
      });

      if (!borrowing) {
        throw new NotFoundException(`Borrowing with ID ${id} not found`);
      }

      if (
        ![BorrowingStatus.BORROWED, BorrowingStatus.OVERDUE].includes(
          borrowing.status,
        )
      ) {
        throw new BadRequestException('Only active loans can be returned');
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

    if (
      ![BorrowingStatus.BORROWED, BorrowingStatus.OVERDUE].includes(
        borrowing.status,
      )
    ) {
      throw new BadRequestException('Only active loans can be extended');
    }

    // Extend due date by 7 days
    const currentDueDate = new Date(borrowing.dueDate);
    currentDueDate.setDate(currentDueDate.getDate() + 7);

    borrowing.dueDate = currentDueDate;
    borrowing.extendedCount = (borrowing.extendedCount || 0) + 1;

    return this.borrowingRepository.save(borrowing);
  }
}
