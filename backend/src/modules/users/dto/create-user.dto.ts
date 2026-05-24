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
}
