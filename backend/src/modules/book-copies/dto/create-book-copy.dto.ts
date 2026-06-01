import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { BookCondition, BookCopyStatus } from '../entities/book-copy.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookCopyDto {
  @ApiProperty()
  @IsString()
  barcode: string;

  @ApiProperty({
    enum: BookCopyStatus,
  })
  @IsEnum(BookCopyStatus)
  @IsOptional()
  status?: BookCopyStatus;

  @ApiProperty({
    enum: BookCondition,
  })
  @IsEnum(BookCondition)
  @IsOptional()
  condition?: BookCondition;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  shelfId?: string;

  @ApiProperty()
  @IsString()
  bookId: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  purchasePrice?: number;
}
