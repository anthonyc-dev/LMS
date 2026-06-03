import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BookCondition, BookCopyStatus } from '../entities/book-copy.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBookCopyDto {
  @ApiProperty({
    enum: BookCopyStatus,
    default: BookCopyStatus.AVAILABLE,
    required: true,
  })
  @IsEnum(BookCopyStatus)
  @IsNotEmpty()
  status: BookCopyStatus;

  @ApiProperty({
    enum: BookCondition,
    default: BookCondition.GOOD,
    required: false,
  })
  @IsEnum(BookCondition)
  @IsOptional()
  condition?: BookCondition;

  @ApiPropertyOptional({
    example: 'notes',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    example: '7452f42f-996b-40d0-8a5b-70c0a8354fca',
    required: false,
  })
  @IsString()
  @IsOptional()
  shelfId?: string;

  @ApiProperty({
    example: '7452f42f-996b-40d0-8a5b-70c0a8354fca',
    required: true,
    description: 'ID of the book',
  })
  @IsString()
  bookId: string;

  @ApiPropertyOptional({
    example: 100,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  purchasePrice?: number;

  @ApiPropertyOptional({
    example: '2025-01-01',
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  acquiredAt?: Date;
}
