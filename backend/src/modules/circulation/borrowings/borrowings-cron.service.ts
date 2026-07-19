import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Borrowing } from './entities/borrowing.entity';
import { BorrowingStatus } from '../../../common/enums/enum.enums';

@Injectable()
export class BorrowingsCronService {
  private readonly logger = new Logger(BorrowingsCronService.name);

  constructor(
    @InjectRepository(Borrowing)
    private readonly borrowingRepository: Repository<Borrowing>,
  ) {}

  @Cron(CronExpression.EVERY_2ND_MONTH)
  async deleteOldHistory() {
    this.logger.log('Running cron job: deleteOldHistory');

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const oldRecords = await this.borrowingRepository.find({
      where: [
        {
          status: BorrowingStatus.RETURNED,
          updatedAt: LessThan(oneMonthAgo),
        },
        {
          status: BorrowingStatus.REJECTED,
          updatedAt: LessThan(oneMonthAgo),
        },
      ],
    });

    if (oldRecords.length > 0) {
      this.logger.log(
        `Found ${oldRecords.length} old borrowing records. Deleting...`,
      );
      // Use soft delete since we have a deletedAt column.
      await this.borrowingRepository.softRemove(oldRecords);
      this.logger.log('Old borrowing records deleted successfully.');
    } else {
      this.logger.log('No old borrowing records found.');
    }
  }
}
