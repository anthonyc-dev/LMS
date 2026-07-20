import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateVisitDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
