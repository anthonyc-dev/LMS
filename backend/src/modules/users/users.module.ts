import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { JwtStrategy } from 'src/common/guard/jwt.strategy';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, RolesGuard, JwtStrategy],
  exports: [UsersService],
})
export class UsersModule {}
