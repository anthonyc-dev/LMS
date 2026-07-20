import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateShelfSectionItem {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The id of the shelf section',
    example: 'uuid',
  })
  id?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The name of the shelf section',
    example: 'Section A',
  })
  name: string;
}

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
  floor: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The description of the shelf',
    example: 'A shelf for fiction books',
  })
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateShelfSectionItem)
  @ApiPropertyOptional({
    description: 'Sections to create within this shelf',
    type: [CreateShelfSectionItem],
  })
  sections?: CreateShelfSectionItem[];
}
