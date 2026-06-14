import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookCopy } from 'src/modules/book-copies/entities/book-copy.entity';
import { Borrowing } from 'src/modules/borrowings/entities/borrowing.entity';
import { Category } from 'src/modules/categories/entities/category.entity';
import { Inventory } from 'src/modules/inventory/entities/inventory.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'books' })
export class Book {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ nullable: false })
  title: string;

  @ApiProperty()
  @Column({ nullable: false, type: 'text' })
  description: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  author?: string;

  @ApiProperty()
  @Column({ nullable: false, unique: true })
  isbn: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  publisher?: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  publishedDate?: Date;

  @ApiProperty()
  @Column('uuid', { nullable: false })
  categoryId: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  pages?: number;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  coverImage?: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  edition?: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  language?: string;

  // @ApiPropertyOptional()
  // @Column({ nullable: true }) // soom relationnal tabl
  // rating?: number;

  // @ApiPropertyOptional()
  // @Column({ nullable: true }) // soom relationnal tabl
  // reviewCount?: number;

  // @ApiProperty()
  // @Column({ nullable: false, default: 'Available' }) // soom relationnal table
  // status: string;

  // @ApiProperty()
  // @Column({ nullable: false, default: 0 })
  // lendCount: number;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiPropertyOptional()
  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => Category, (category) => category.books)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToOne(() => Inventory, (inventory) => inventory.book)
  inventory: Inventory;

  @OneToMany(() => BookCopy, (copy) => copy.book)
  bookCopies: BookCopy[];

  // @ManyToOne(() => Shelf, (shelf) => shelf.books)
  // @JoinColumn({ name: 'shelfId' })
  // shelf: Shelf;

  // @Column()
  // shelfId: string;
}
