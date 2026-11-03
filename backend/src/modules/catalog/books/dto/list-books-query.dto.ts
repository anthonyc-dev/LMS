import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
export enum CatalogFormat {
  ALL = 'all',
  PHYSICAL = 'physical',
  EBOOK = 'ebook',
  BOTH = 'both',
}
export class ListBooksQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit: number = 10;
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
  @IsOptional()
  @IsEnum(CatalogFormat)
  format: CatalogFormat = CatalogFormat.ALL;
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
