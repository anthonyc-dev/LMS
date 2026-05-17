import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
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
    message: 'Phone number must be a valid PH format (09XXXXXXXXX or +639XXXXXXXXX)',
  })
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}
