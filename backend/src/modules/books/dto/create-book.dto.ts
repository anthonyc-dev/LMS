import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsInt, Min, IsNotEmpty, IsOptional, IsDateString, IsNumber, IsUUID } from 'class-validator';

export class CreateBookDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The title of the book',
        example: 'The Great Gatsby'
    })
    title: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'The description of the book',
        example: 'A book about a boy wizard'
    })
    description?: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The author of the book',
        example: 'J.K. Rowling'
    })
    author: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The isbn of the book',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    isbn: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'The publisher of the book',
        example: 'Penguin Random House'
    })
    publisher?: string;

    @IsDateString()
    @IsOptional()
    @ApiProperty({
        description: 'The published date of the book',
        example: '2022-01-01'
    })
    publishedDate?: Date;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The id of the category',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    categoryId: string;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    @IsOptional()
    @ApiProperty({
        description: 'The number of pages of the book',
        example: 100
    })
    pages?: number;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    @IsNotEmpty()
    @ApiProperty({
        description: 'The stock of the book',
        example: 5
    })
    stock: number;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'The cover image of the book',
        example: 'https://example.com/cover.jpg'
    })
    coverImage?: string;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'The rating of the book',
        example: 5
    })
    rating?: number;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'The review count of the book',
        example: 5
    })
    reviewCount?: number;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'The status of the book',
        example: 'available'
    })
    status?: string;


    @ApiProperty({
        description: 'The id of the shelf',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    shelfId: string;
}
