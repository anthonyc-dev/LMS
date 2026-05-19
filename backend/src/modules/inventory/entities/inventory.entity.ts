import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

import { Book } from '../../books/entities/book.entity';

@Entity('inventory')
export class Inventory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'int',
        default: 0,
    })
    quantity: number;

    @Column({
        type: 'int',
        default: 0,
    })
    availableQuantity: number;

    @Column({
        nullable: true,
    })
    shelf: string;

    @OneToOne(() => Book, (book) => book.inventory, {
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    book: Book;

    @Column()
    bookId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}