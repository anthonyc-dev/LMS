
import { Book } from "src/modules/books/entities/book.entity";
import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity('shelves')
@Index(['code', 'name', 'location', 'capacity'])
export class Shelf {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    code: string;

    @Column()
    name: string;

    @Column()
    location: string;

    @Column({ default: 100 })
    capacity: number;

    @OneToMany(() => Book, (book) => book.shelf)
    books: Book[];
}
