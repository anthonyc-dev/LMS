import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BookCondition, BookCopyStatus } from 'src/common/enums/enum.enums';

export class UpdateBookCopyDto {
  @ApiPropertyOptional({
    example: 'UUID of the book',
    required: false,
  })
  @IsString()
  @IsOptional()
  bookId?: string;

  @IsOptional()
  purchasePrice?: number;

  @IsOptional()
  acquiredAt?: Date;

  @IsEnum(BookCondition)
  @IsOptional()
  condition?: BookCondition;

  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    example: 'UUID of the shelf section',
    required: false,
  })
  @IsString()
  @IsOptional()
  shelfSectionId?: string;

  @IsEnum(BookCopyStatus)
  @IsOptional()
  status?: BookCopyStatus;
}
