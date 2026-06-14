import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BorrowingStatus } from 'src/common/enums/enum.enums';
import { BookCopy } from 'src/modules/book-copies/entities/book-copy.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('borrowings')
@Index(['userId', 'bookCopyId', 'status'])
export class Borrowing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid', { nullable: false })
  userId: string;

  @ApiProperty()
  @Column('uuid', { nullable: false })
  bookCopyId: string;

  @ApiProperty()
  @Column('timestamp', { nullable: false })
  borrowDate: Date;

  @ApiProperty()
  @Column('timestamp', { nullable: false })
  dueDate: Date;

  @ApiPropertyOptional()
  @Column('timestamp', { nullable: true })
  returnedDate?: Date;

  @ApiProperty()
  @Column('varchar', { nullable: false, length: 50, default: 'pending' })
  status: BorrowingStatus;

  @ApiProperty()
  @Column('int', { nullable: false, default: 0 })
  extendedCount: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date;

  @ManyToOne(() => User, (user) => user.borrowings, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => BookCopy, (bookCopy) => bookCopy.borrowings, {
    onDelete: 'CASCADE',
  })
  bookCopy: BookCopy;
}
