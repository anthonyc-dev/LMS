import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsBoolean,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { DepartmentEnum, YearLevelEnum } from 'src/common/enums/enum.enums';

export class RegisterDto {
  @ApiProperty({
    example: '21-0123',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}-\d{4}$/, {
    message: 'School ID must be a valid format (xx-xxxx)',
  })
  schoolId: string;

  @ApiProperty({
    example: 'John Doe',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({
    example: 'user@example.com',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '09123456789',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(09|\+639)\d{9}$/, {
    message:
      'Phone number must be a valid PH format (09XXXXXXXXX or +639XXXXXXXXX)',
  })
  phoneNumber: string;

  @ApiProperty({
    example: DepartmentEnum.EECS,
    required: true,
    description: 'Department of the user',
  })
  @IsNotEmpty()
  @IsEnum(DepartmentEnum)
  department: DepartmentEnum;

  @ApiProperty({
    example: YearLevelEnum.FIRST_YEAR,
    required: false,
    description: 'Year level of the user',
  })
  @IsOptional()
  @IsEnum(YearLevelEnum)
  yearLevel?: YearLevelEnum;

  @ApiProperty({
    example: 'strongpassword123',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    type: 'boolean',
    example: true,
    required: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  acceptedTerms: boolean;

  @ApiProperty({
    type: 'string',
    example: '::1',
    required: false,
  })
  @IsString()
  @IsOptional()
  ipAddress?: string;
}
