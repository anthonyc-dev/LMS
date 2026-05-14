import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Borrowing } from "src/modules/borrowings/entities/borrowing.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "books" })
export class Book {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column({ nullable: false })
    title: string;

    @ApiProperty()
    @Column({ nullable: false, type: "text" })
    description: string;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    author?: string;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    isbn?: string;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    publisher?: string;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    publishedDate?: Date;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    category?: string;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    pages?: number;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    stock?: number;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    coverImage?: string;

    @ApiPropertyOptional()
    @Column({ nullable: true })  // soom relationnal tabl
    rating?: number;

    @ApiPropertyOptional()
    @Column({ nullable: true })  // soom relationnal tabl
    reviewCount?: number;

    @ApiProperty()
    @Column({ nullable: false, default: 'Available' }) // soom relationnal table
    status: string;

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

    @OneToMany(() => Borrowing, (borrowing) => borrowing.book)
    borrowings: Borrowing[];
}
