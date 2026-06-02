import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookCopy } from 'src/modules/book-copies/entities/book-copy.entity';

@Entity({ name: 'shelves' })
export class Shelf {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'A-01',
  })
  @Column({
    unique: true,
    nullable: false,
  })
  code: string;

  @ApiPropertyOptional({
    example: 'Computer Science Section',
  })
  @Column({
    nullable: false,
  })
  name: string;

  @ApiPropertyOptional({
    example: 'Second floor near entrance',
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @ApiPropertyOptional({
    example: 'Floor 2',
  })
  @Column({
    nullable: true,
  })
  floor?: string;

  @ApiPropertyOptional({
    example: 'West Wing',
  })
  @Column({
    nullable: true,
  })
  section?: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiPropertyOptional()
  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToMany(() => BookCopy, (bookCopy) => bookCopy.shelf)
  bookCopies: BookCopy[];
}
