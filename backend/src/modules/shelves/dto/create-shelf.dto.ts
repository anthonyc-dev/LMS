import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateShelfDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The code of the shelf',
    example: 'SHE-001',
  })
  code: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The name of the shelf',
    example: 'Shelf A',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The location of the shelf',
    example: 'First Floor',
  })
  location: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The description of the shelf',
    example: 'A shelf for fiction books',
  })
  description: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The capacity of the shelf',
    example: 100,
  })
  capacity: number;
}
