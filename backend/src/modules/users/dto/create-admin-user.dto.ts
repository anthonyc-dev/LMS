import { ApiProperty } from '@nestjs/swagger';
import {
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

export class CreateAdminUserDto {
  @ApiProperty({ example: 'ADM-0001' })
  @IsNotEmpty()
  @IsString()
  schoolId: string;

  @ApiProperty({ example: 'Admin User' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'admin@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '09123456789' })
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
    required: false,
    description: 'Optional. Auto-generated if not provided',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({
    enum: Role,
    example: Role.STUDENT,
    required: false,
    default: Role.STUDENT,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({
    type: 'string',
    example: '::1',
    required: false,
  })
  @IsString()
  @IsOptional()
  ipAddress?: string;
}
