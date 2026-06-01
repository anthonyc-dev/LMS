import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// import { Book } from 'src/modules/books/entities/book.entity';
// import { Borrowing } from 'src/modules/borrowings/entities/borrowing.entity';
// import { Shelf } from 'src/modules/shelves/entities/shelf.entity';

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  // JoinColumn,
  // ManyToOne,
  // OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum BookCopyStatus {
  AVAILABLE = 'AVAILABLE',
  BORROWED = 'BORROWED',
  RESERVED = 'RESERVED',
  LOST = 'LOST',
  DAMAGED = 'DAMAGED',
  MAINTENANCE = 'MAINTENANCE',
}

export enum BookCondition {
  NEW = 'NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  DAMAGED = 'DAMAGED',
}

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

  //   // Book Relation
  //   @ApiProperty()
  //   @Column('uuid')
  //   bookId: string;

  //   @ManyToOne(() => Book, (book) => book.copies, {
  //     onDelete: 'CASCADE',
  //   })
  //   @JoinColumn({ name: 'bookId' })
  //   book: Book;

  //   // Shelf Relation
  //   @ApiPropertyOptional()
  //   @Column('uuid', {
  //     nullable: true,
  //   })
  //   shelfId?: string;

  //   @ManyToOne(() => Shelf, (shelf) => shelf.bookCopies, {
  //     nullable: true,
  //     onDelete: 'SET NULL',
  //   })
  //   @JoinColumn({ name: 'shelfId' })
  //   shelf: Shelf;

  //   // Borrow History
  //   @OneToMany(() => Borrowing, (borrowing) => borrowing.bookCopy)
  //   borrowings: Borrowing[];

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
