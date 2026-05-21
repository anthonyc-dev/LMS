import { Type } from 'class-transformer';
import { IsString, IsInt, Min, IsNotEmpty, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateBookDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsNotEmpty()
    author: string;

    @IsString()
    @IsNotEmpty()
    isbn: string;

    @IsString()
    @IsOptional()
    publisher?: string;

    @IsDateString()
    @IsOptional()
    publishedDate?: Date;

    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    @IsOptional()
    pages?: number;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    @IsNotEmpty()
    stock: number;

    @IsString()
    @IsOptional()
    coverImage?: string;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    rating?: number;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    reviewCount?: number;

    @IsString()
    @IsOptional()
    status?: string;
}
