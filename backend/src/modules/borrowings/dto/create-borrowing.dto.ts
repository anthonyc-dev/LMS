import {
    IsDate,
    IsInt,
    IsNotEmpty,
    IsEnum,
    IsOptional,
    IsUUID
} from 'class-validator';
import { BorrowingStatus } from '../entities/borrowing.entity';
import { Type } from 'class-transformer';

export class CreateBorrowingDto {
    @IsNotEmpty()
    @IsUUID()
    userId: string;

    @IsNotEmpty()
    @IsUUID()
    bookId: string;

    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    dueDate: Date;

    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    borrowDate: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    returnedDate?: Date;

    @IsNotEmpty()
    @IsEnum(BorrowingStatus)
    status: BorrowingStatus;

    @IsOptional()
    @IsInt()
    extendedCount?: number;
}
