import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookCondition, BookCopyStatus } from 'src/common/enums/enum.enums';
import { Book } from 'src/modules/catalog/books/entities/book.entity';
import { Borrowing } from 'src/modules/circulation/borrowings/entities/borrowing.entity';
import { ShelfSection } from 'src/modules/catalog/shelf-sections/entities/shelf-section.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'book_copies' })
export class BookCopy {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Physical barcode of the copy
  @ApiProperty()
  @Index()
  @Column({
    unique: true,
    nullable: false,
    length: 100,
  })
  barcode: string;

  // Current availability status
  @ApiProperty({
    enum: BookCopyStatus,
  })
  @Column({
    type: 'enum',
    enum: BookCopyStatus,
    default: BookCopyStatus.AVAILABLE,
  })
  status: BookCopyStatus;

  // Physical condition of the book
  @ApiProperty({
    enum: BookCondition,
  })
  @Column({
    type: 'enum',
    enum: BookCondition,
    default: BookCondition.GOOD,
  })
  condition: BookCondition;

  // Optional notes
  @ApiPropertyOptional()
  @Column({
    type: 'text',
    nullable: true,
  })
  notes?: string;

  // Date acquired by library
  @ApiPropertyOptional()
  @Column({
    type: 'date',
    nullable: true,
  })
  acquiredAt?: Date;

  // Purchase price
  @ApiPropertyOptional()
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  purchasePrice?: number;

  // Book Relation
  @ApiProperty()
  @Column('uuid')
  bookId: string;

  @ManyToOne(() => Book, (book) => book.bookCopies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bookId' })
  book: Book;

  // Shelf Section Relation
  @ApiPropertyOptional()
  @Column({ type: 'uuid', nullable: true })
  shelfSectionId?: string;

  @ManyToOne(() => ShelfSection, (section) => section.bookCopies, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'shelfSectionId' })
  shelfSection?: ShelfSection;

  @OneToMany(() => Borrowing, (borrowing) => borrowing.bookCopy)
  borrowings: Borrowing[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiPropertyOptional()
  @DeleteDateColumn()
  deletedAt?: Date;
}
