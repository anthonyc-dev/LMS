import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { Borrowing } from '../../circulation/borrowings/entities/borrowing.entity';
import { BookCopy } from '../../circulation/book-copies/entities/book-copy.entity';
import { Book } from '../../catalog/books/entities/book.entity';
import { User } from '../../identity/users/entities/user.entity';
import { Fine, FineStatus } from '../../circulation/fines/entities/fine.entity';
import { Role } from 'src/common/enums/role.enum';
import { BorrowingStatus } from 'src/common/enums/enum.enums';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(Borrowing) private borrowingRepo: Repository<Borrowing>,
    @InjectRepository(BookCopy) private bookCopyRepo: Repository<BookCopy>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Fine) private fineRepo: Repository<Fine>,
    @InjectRepository(Book) private bookRepo: Repository<Book>,
  ) {}

  async getAdminDashboardStats() {
    this.logger.log('Fetching admin dashboard stats');

    const totalCatalog = await this.bookCopyRepo.count();

    const activeMembers = await this.userRepo.count({
      where: [{ role: Role.STUDENT }, { role: Role.FACULTY }],
    });

    const activeBorrows = await this.borrowingRepo.count({
      where: { status: BorrowingStatus.BORROWED },
    });

    const overdueAlerts = await this.borrowingRepo.count({
      where: [
        { status: BorrowingStatus.OVERDUE },
        { status: BorrowingStatus.BORROWED, dueDate: LessThan(new Date()) },
      ],
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const fines = await this.fineRepo.find({
      where: { status: FineStatus.PAID, paidAt: Between(startOfMonth, now) },
    });
    const fineCollections = fines.reduce(
      (sum, fine) => sum + Number(fine.amount),
      0,
    );

    const booksWithCategory = await this.bookRepo.find({
      relations: { category: true },
    });
    const categoryCounts: Record<string, number> = {};
    for (const book of booksWithCategory) {
      const catName = book.category?.name || 'Uncategorized';
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    }
    const totalBooks = booksWithCategory.length || 1;
    const colors = [
      '#2563EB',
      '#3B82F6',
      '#60A5FA',
      '#94A3B8',
      '#CBD5E1',
      '#8b5cf6',
      '#d946ef',
      '#f43f5e',
      '#f97316',
    ];
    const categoryDistribution = Object.entries(categoryCounts).map(
      ([name, count], index) => {
        return {
          name,
          value: Math.round((count / totalBooks) * 100),
          color: colors[index % colors.length],
        };
      },
    );

    const recentLogsRaw = await this.borrowingRepo.find({
      relations: { user: true, bookCopy: { book: true } },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const recentLogs = recentLogsRaw.map((log) => {
      let type = 'loan';
      let status = 'success';
      if (log.status === BorrowingStatus.RETURNED) {
        type = 'return';
        status = 'info';
      } else if (
        log.status === BorrowingStatus.OVERDUE ||
        (log.status === BorrowingStatus.BORROWED &&
          new Date(log.dueDate) < new Date())
      ) {
        type = 'overdue';
        status = 'warning';
      }

      return {
        id: log.id,
        type,
        user: log.user?.fullName || 'Unknown',
        book: log.bookCopy?.book?.title || 'Unknown Book',
        time:
          new Date(log.createdAt).toLocaleDateString() +
          ' ' +
          new Date(log.createdAt).toLocaleTimeString(),
        status,
      };
    });

    const borrowingTrendsData: {
      month: string;
      checkouts: number;
      returns: number;
    }[] = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const checkouts = await this.borrowingRepo.count({
        where: { borrowDate: Between(start, end) },
      });
      const returns = await this.borrowingRepo.count({
        where: { returnedDate: Between(start, end) },
      });

      borrowingTrendsData.push({
        month: start.toLocaleDateString('en-US', { month: 'short' }),
        checkouts,
        returns,
      });
    }

    return {
      totalCatalog,
      activeMembers,
      activeBorrows,
      overdueAlerts,
      fineCollections,
      categoryDistribution,
      recentLogs,
      borrowingTrendsData,
    };
  }

  async getUserDashboardStats(userId: string) {
    this.logger.log(`Fetching user dashboard stats for ${userId}`);

    const activeBorrows = await this.borrowingRepo.find({
      where: [
        { userId, status: BorrowingStatus.BORROWED },
        { userId, status: BorrowingStatus.OVERDUE },
      ],
      relations: { bookCopy: { book: { category: true } } },
    });

    const checkedOutCount = activeBorrows.length;

    let nextDeadlineDays: number | null = null;
    let nextDeadlineDate: string | null = null;

    const activeLoans = activeBorrows.map((b) => {
      const diffTime = new Date(b.dueDate).getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (nextDeadlineDays === null || diffDays < nextDeadlineDays) {
        nextDeadlineDays = diffDays;
        nextDeadlineDate = new Date(b.dueDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }

      const totalTime =
        new Date(b.dueDate).getTime() - new Date(b.borrowDate).getTime();
      const totalDays = Math.max(
        1,
        Math.ceil(totalTime / (1000 * 60 * 60 * 24)),
      );

      return {
        id: b.id,
        title: b.bookCopy?.book?.title || 'Unknown',
        author: b.bookCopy?.book?.author || 'Unknown',
        dueDate: new Date(b.dueDate).toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
        daysRemaining: diffDays,
        totalDays: totalDays,
        cover: b.bookCopy?.book?.coverImage || '',
        category: b.bookCopy?.book?.category?.name || 'Book',
        renewCount: b.extendedCount || 0,
      };
    });

    const readBooksCount = await this.borrowingRepo.count({
      where: { userId, status: BorrowingStatus.RETURNED },
    });

    const unpaidFines = await this.fineRepo.find({
      where: { borrowing: { userId }, status: FineStatus.UNPAID },
      relations: { borrowing: true },
    });

    const outstandingFines = unpaidFines.reduce(
      (sum, f) => sum + Number(f.amount),
      0,
    );

    return {
      checkedOut: checkedOutCount,
      nextDeadlineDays: nextDeadlineDays !== null ? nextDeadlineDays : 'None',
      nextDeadlineDate: nextDeadlineDate || 'All clear',
      readBooksCount,
      outstandingFines,
      activeLoans,
    };
  }
}
