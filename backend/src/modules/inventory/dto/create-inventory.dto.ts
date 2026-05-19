import { ApiProperty } from '@nestjs/swagger';
import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Min,
} from 'class-validator';

export class CreateInventoryDto {
    @ApiProperty(
        {
            example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        }
    )
    @IsUUID()
    bookId: string;

    @ApiProperty(
        {
            example: 10,
        }
    )
    @IsInt()
    @Min(0)
    quantity: number;

    @ApiProperty(
        {
            example: 10,
        }
    )
    @IsInt()
    @Min(0)
    availableQuantity: number;

    @ApiProperty(
        {
            example: 'A1',
        }
    )
    @IsOptional()
    @IsString()
    shelf?: string;
}