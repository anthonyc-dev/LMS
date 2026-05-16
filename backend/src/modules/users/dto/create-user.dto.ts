import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

export class CreateUserDto {
    @ApiProperty({ example: '202400123' })
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
}