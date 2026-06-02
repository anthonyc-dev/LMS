import { Module } from '@nestjs/common';
import { ShelvesService } from './shelves.service';
import { ShelvesController } from './shelves.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shelf } from './entities/shelf.entity';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { JwtStrategy } from 'src/common/guard/jwt.strategy';
import { BookCopiesModule } from '../book-copies/book-copies.module';

@Module({
  imports: [TypeOrmModule.forFeature([Shelf]), BookCopiesModule],
  controllers: [ShelvesController],
  providers: [ShelvesService, RolesGuard, JwtStrategy],
})
export class ShelvesModule {}
