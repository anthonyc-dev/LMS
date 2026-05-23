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
} from '@nestjs/common';

import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryService } from './inventory.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from 'src/common/guard/passport-auth.guard';
import { Role } from 'src/common/enums/role.enum';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
@Throttle({ default: { limit: 5, ttl: 60000 } }) //for development only
export class InventoryController {
  constructor(private readonly inventoriesService: InventoryService) {}

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoriesService.create(createInventoryDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.inventoriesService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.inventoriesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoriesService.update(id, updateInventoryDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.inventoriesService.remove(id);
  }
}
