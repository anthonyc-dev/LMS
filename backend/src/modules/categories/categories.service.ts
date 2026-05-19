import { Injectable, Logger } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DataSource, Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);
  private categoryRepository: Repository<Category>;

  constructor(
    private readonly dataSource: DataSource,
  ) {
    this.categoryRepository = this.dataSource.getRepository(Category);
  }

  create(createCategoryDto: CreateCategoryDto) {
    this.logger.log('Creating category', createCategoryDto);
    return this.categoryRepository.save(createCategoryDto);
  }

  async findAll() {
    this.logger.log('Finding all categories');
    return await this.categoryRepository.find();
  }

  async findOne(id: string) {
    this.logger.log('Finding category with id', id);
    return await this.categoryRepository.findOneBy({ id });
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto) {
    this.logger.log('Updating category with id', id);
    return this.categoryRepository.update(id, updateCategoryDto);
  }

  remove(id: string) {
    this.logger.log('Removing category with id', id);
    return this.categoryRepository.delete(id);
  }
}
