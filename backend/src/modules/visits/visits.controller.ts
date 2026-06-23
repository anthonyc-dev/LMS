import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guard/passport-auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post()
  create(@Body() createVisitDto: CreateVisitDto) {
    return this.visitsService.create(createVisitDto);
  }

  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post('scan')
  scan(@Body('barcode') barcode: string) {
    return this.visitsService.scan(barcode);
  }

  @Roles(Role.ADMIN, Role.FACULTY)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @Get()
  findAll() {
    return this.visitsService.findAll();
  }

  @Roles(Role.ADMIN, Role.FACULTY)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.visitsService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateVisitDto: UpdateVisitDto,
  ) {
    return this.visitsService.update(id, updateVisitDto);
  }

  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.visitsService.remove(id);
  }
}
