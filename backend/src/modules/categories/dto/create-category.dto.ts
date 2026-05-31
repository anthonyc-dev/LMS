import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Fiction',
    description: 'Category name',
  })
  @IsNotEmpty({ message: 'Category name is required' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Books belonging to fiction genre',
    description: 'Category description',
  })
  @IsString()
  description: string;
}
