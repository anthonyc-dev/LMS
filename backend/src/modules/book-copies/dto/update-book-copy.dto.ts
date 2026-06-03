import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BookCondition, BookCopyStatus } from '../entities/book-copy.entity';

export class UpdateBookCopyDto {
  @IsEnum(BookCondition)
  @IsOptional()
  condition?: BookCondition;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  shelfId?: string;

  @IsEnum(BookCopyStatus)
  @IsOptional()
  status?: BookCopyStatus;
}
