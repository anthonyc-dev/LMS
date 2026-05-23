import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ShelvesService } from './shelves.service';
import { CreateShelfDto } from './dto/create-shelf.dto';
import { UpdateShelfDto } from './dto/update-shelf.dto';

@Controller('shelves')
export class ShelvesController {
  constructor(private readonly shelvesService: ShelvesService) {}

  @Post()
  create(@Body() createShelfDto: CreateShelfDto) {
    return this.shelvesService.create(createShelfDto);
  }

  @Get()
  findAll() {
    return this.shelvesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.shelvesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateShelfDto: UpdateShelfDto,
  ) {
    return this.shelvesService.update(id, updateShelfDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.shelvesService.remove(id);
  }
}
