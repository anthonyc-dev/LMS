import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { FineType, FineStatus } from '../entities/fine.entity';

export class CreateFineDto {
  @IsString()
  @IsNotEmpty()
  borrowingId: string;

  @IsEnum(FineType)
  type: FineType;

  @IsEnum(FineStatus)
  status: FineStatus;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
