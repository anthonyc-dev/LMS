import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateShelfSectionDto {
  @ApiProperty({
    example: 'Section A',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'UUID of the shelf',
  })
  @IsString()
  @IsNotEmpty()
  shelfId: string;
}
