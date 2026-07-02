import {
  IsDate,
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BorrowingStatus } from 'src/common/enums/enum.enums';

export class CreateBulkBorrowingDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: ['book-copy-uuid-1', 'book-copy-uuid-2'],
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('all', { each: true })
  bookCopyIds: string[];

  @ApiProperty({ example: '2026-01-01T00:00:00Z' })
  @Type(() => Date)
  @IsDate()
  borrowDate: Date;

  @ApiProperty({ example: '2026-01-15T00:00:00Z' })
  @Type(() => Date)
  @IsDate()
  dueDate: Date;

  @ApiProperty({
    enum: BorrowingStatus,
    example: BorrowingStatus.BORROWED,
  })
  @IsNotEmpty()
  @IsEnum(BorrowingStatus)
  status: BorrowingStatus;
}
