import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BorrowingStatus } from 'src/common/enums/enum.enums';

export class CreateBorrowingDto {
  @ApiPropertyOptional({ example: 'user-uuid' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ example: 'book-copy-uuid' })
  @IsNotEmpty()
  @IsUUID()
  bookCopyId: string;

  @ApiProperty({ example: '2026-01-01T00:00:00Z' })
  @Type(() => Date)
  @IsDate()
  borrowDate: Date;

  @ApiProperty({ example: '2026-01-15T00:00:00Z' })
  @Type(() => Date)
  @IsDate()
  dueDate: Date;

  @ApiPropertyOptional({ example: '2026-01-10T00:00:00Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  returnedDate?: Date;

  @ApiProperty({
    enum: BorrowingStatus,
    example: BorrowingStatus.PENDING,
  })
  @IsNotEmpty()
  @IsEnum(BorrowingStatus)
  status: BorrowingStatus;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  extendedCount?: number;
}
