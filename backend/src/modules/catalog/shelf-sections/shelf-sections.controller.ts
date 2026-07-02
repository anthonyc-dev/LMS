import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ShelfSectionsService } from './shelf-sections.service';
import { CreateShelfSectionDto } from './dto/create-shelf-section.dto';
import { UpdateShelfSectionDto } from './dto/update-shelf-section.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { JwtAuthGuard } from 'src/common/guard/passport-auth.guard';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('shelf-sections')
export class ShelfSectionsController {
  constructor(private readonly shelfSectionsService: ShelfSectionsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createShelfSectionDto: CreateShelfSectionDto) {
    return this.shelfSectionsService.create(createShelfSectionDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.shelfSectionsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.shelfSectionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateShelfSectionDto: UpdateShelfSectionDto,
  ) {
    return this.shelfSectionsService.update(id, updateShelfSectionDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.shelfSectionsService.remove(id);
  }
}
