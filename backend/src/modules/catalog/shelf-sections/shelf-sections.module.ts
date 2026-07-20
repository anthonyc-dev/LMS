import { Module } from '@nestjs/common';
import { ShelfSectionsService } from './shelf-sections.service';
import { ShelfSectionsController } from './shelf-sections.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShelfSection } from './entities/shelf-section.entity';
import { ShelvesModule } from '../shelves/shelves.module';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { JwtStrategy } from 'src/common/guard/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([ShelfSection]), ShelvesModule],
  controllers: [ShelfSectionsController],
  providers: [ShelfSectionsService, RolesGuard, JwtStrategy],
  exports: [ShelfSectionsService, TypeOrmModule],
})
export class ShelfSectionsModule {}
