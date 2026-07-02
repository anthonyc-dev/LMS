import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BookCopy } from 'src/modules/circulation/book-copies/entities/book-copy.entity';
import { Shelf } from 'src/modules/catalog/shelves/entities/shelf.entity';

@Entity('shelf_sections')
export class ShelfSection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Shelf, (shelf) => shelf.sections, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  shelf: Shelf;

  @OneToMany(() => BookCopy, (copy) => copy.shelfSection)
  bookCopies: BookCopy[];
}
