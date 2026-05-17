import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Role } from 'src/common/enums/role.enum';

export class UserResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    @Expose()
    schoolId: string;

    @ApiProperty()
    @Expose()
    fullName: string;

    @ApiProperty()
    @Expose()
    email: string;

    @ApiProperty()
    @Expose()
    phoneNumber: string;
}