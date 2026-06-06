import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { DepartmentEnum, YearLevelEnum } from 'src/common/enums/enum.enums';
import { Role } from 'src/common/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({ example: '20-0000' })
  @IsNotEmpty()
  @IsString()
  schoolId: string;

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'john@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '0912345678' })
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

  @ApiProperty({ example: 'strongpassword123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    enum: Role,
    example: Role.STUDENT,
    required: false,
  })
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({
    type: 'boolean',
    example: true,
    required: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  acceptedTerms: boolean;

  @ApiProperty({
    type: 'string',
    example: '::1',
    required: false,
  })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiProperty({
    type: 'string',
    example: 'https://example.com/avatar.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
