import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { VisitStatus } from 'src/common/enums/enum.enums';

export class UpdateVisitDto {
  @IsOptional()
  @IsEnum(VisitStatus)
  status?: VisitStatus;

  @IsOptional()
  @IsDateString()
  timeOut?: string;
}
