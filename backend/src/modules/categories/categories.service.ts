import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Not, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from '../books/entities/book.entity';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    this.logger.log('Creating category', createCategoryDto);

    // Check if category already exists with the same name
    const existingCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new ConflictException('Category already exists');
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async findAll() {
    this.logger.log('Finding all categories');

    const categories = await this.categoryRepository.find({
      relations: ['books'],
    });

    return categories;
  }

  async findOne(id: string) {
    this.logger.log('Finding category with id', id);

    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['books'],
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    this.logger.log('Updating category with id', id);

    // Check if category exists
    const existingCategory = await this.categoryRepository.findOneBy({ id });

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    // Check if another category with the same name exists (excluding the current one)
    const duplicateCategory = await this.categoryRepository.findOne({
      where: {
        name: updateCategoryDto.name,
        id: Not(id),
      },
    });

    if (duplicateCategory) {
      throw new ConflictException(
        'Another category with this name already exists',
      );
    }

    return await this.categoryRepository.update(id, updateCategoryDto);
  }

  async remove(id: string) {
    this.logger.log(`Removing category with id: ${id}`);

    const existingCategory = await this.categoryRepository.findOneBy({ id });

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    const bookCount = await this.booksRepository.count({
      where: {
        category: {
          id,
        },
      },
    });

    if (bookCount > 0) {
      throw new ConflictException(
        'Cannot delete category with books. Please move books to another category first.',
      );
    }

    await this.categoryRepository.delete(id);

    return {
      message: 'Category deleted successfully',
    };
  }
}
