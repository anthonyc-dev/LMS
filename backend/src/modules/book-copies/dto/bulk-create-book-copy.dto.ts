import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { CreateBookCopyDto } from './create-book-copy.dto';
import { ApiProperty } from '@nestjs/swagger';

export class BulkCreateBookCopyDto extends CreateBookCopyDto {
  @ApiProperty({
    example: 5,
    required: true,
    description: 'Number of copies to create',
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  count: number;
}
