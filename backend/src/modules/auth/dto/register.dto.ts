import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}-\d{4}$/, {
    message: 'School ID must be a valid format (xx-xxxx)',
  })
  schoolId: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(09|\+639)\d{9}$/, {
    message:
      'Phone number must be a valid PH format (09XXXXXXXXX or +639XXXXXXXXX)',
  })
  phoneNumber: string;

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
