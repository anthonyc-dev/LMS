import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEmail,
  Matches,
  IsEnum,
} from 'class-validator';
import { DepartmentEnum, YearLevelEnum } from 'src/common/enums/enum.enums';

export class UpdateProfileDto {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: 'john@gmail.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '0912345678', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^(09|\+639)\d{9}$/, {
    message:
      'Phone number must be a valid PH format (09XXXXXXXXX or +639XXXXXXXXX)',
  })
  phoneNumber?: string;

  @ApiProperty({ example: DepartmentEnum.EECS, required: false })
  @IsOptional()
  @IsEnum(DepartmentEnum)
  department?: DepartmentEnum;

  @ApiProperty({ example: YearLevelEnum.FIRST_YEAR, required: false })
  @IsOptional()
  @IsEnum(YearLevelEnum)
  yearLevel?: YearLevelEnum;

  @ApiProperty({ example: 'https://example.com/avatar.png', required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
