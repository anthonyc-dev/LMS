import { IsEnum, IsOptional } from 'class-validator';
import { BookCondition } from 'src/common/enums/enum.enums';

export class ReturnBorrowingDto {
  @IsEnum(BookCondition)
  @IsOptional()
  condition?: BookCondition;
}
