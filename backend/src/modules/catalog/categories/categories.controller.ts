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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guard/passport-auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) //for development only
  @Roles(Role.ADMIN)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const category = await this.categoriesService.create(createCategoryDto);
    return {
      message: 'Category created successfully',
      data: category,
    };
  }

  @Get()
  @Throttle({ default: { limit: 60, ttl: 60000 } }) //for development only
  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  async findAll() {
    const categories = await this.categoriesService.findAll();
    return {
      message: 'Categories fetched successfully',
      data: categories,
    };
  }

  @Get(':id')
  @Throttle({ default: { limit: 60, ttl: 60000 } }) //for development only
  @Roles(Role.ADMIN, Role.FACULTY, Role.STUDENT)
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const category = await this.categoriesService.findOne(id);
    return {
      message: 'Category fetched successfully',
      data: category,
    };
  }

  @Patch(':id')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) //for development only
  @Roles(Role.ADMIN)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.update(id, updateCategoryDto);

    return {
      message: 'Category updated successfully',
      data: category,
    };
  }

  @Delete(':id')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) //for development only
  @Roles(Role.ADMIN)
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    const category = await this.categoriesService.remove(id);
    return {
      message: 'Category deleted successfully',
      data: category,
    };
  }
}
