import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';
import { DataSource, Repository, ILike, FindManyOptions } from 'typeorm';
import { deleteImageFromCloudinary, uploadImageToCloudinary } from 'src/common/utils/cloudinaryUpload';

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  private bookRepository: Repository<Book>;

  constructor(
    private readonly dataSource: DataSource,
  ) {
    this.bookRepository = this.dataSource.getRepository(Book);
  }
  async create(createBookDto: CreateBookDto, file?: Express.Multer.File) {
    this.logger.log('Creating book', createBookDto);

    try {
      // Upload cover image if provided
      if (file) {
        const coverImageUrl = await uploadImageToCloudinary(
          file,
          'book-covers',
        );

        if (createBookDto.coverImage) {
          try {
            await deleteImageFromCloudinary(
              createBookDto.coverImage,
            );
          } catch (deleteError) {
            this.logger.error(
              'Failed to delete old cover image',
              deleteError,
            );
            throw new Error('Failed to delete old cover image');
          }
        }

        createBookDto.coverImage = coverImageUrl;
      }

      const book = this.bookRepository.create(createBookDto);



      return await this.bookRepository.save(book);
    } catch (error) {
      this.logger.error('Failed to create book', error);

      throw new Error('Failed to create book');
    }
  }

  async findAll(page = 1, limit = 10, search?: string) {
    this.logger.log(`Finding all books (page: ${page}, limit: ${limit}, search: ${search})`);

    const skip = (page - 1) * limit;
    const findOptions: FindManyOptions<Book> = {
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: {
        category: true,
        shelf: true,
      },
    };

    if (search && search.trim() !== '') {
      findOptions.where = [
        { title: ILike(`%${search}%`) },
        { author: ILike(`%${search}%`) },
        { isbn: ILike(`%${search}%`) },
        {
          category: {
            name: ILike(`%${search}%`),
          },
        },
        {
          shelf: {
            name: ILike(`%${search}%`),
          },
        },
      ];
    }

    const [data, total] = await this.bookRepository.findAndCount(findOptions);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  findOne(id: string) {
    this.logger.log('Finding book with id', id);
    return this.bookRepository.findOne({ where: { id }, relations: ['category', 'shelf'] });
  }

  async update(id: string, updateBookDto: UpdateBookDto) {
    this.logger.log('Updating book with id', id);
    const book = await this.findOne(id);
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return this.bookRepository.update(id, updateBookDto);
  }

  async remove(id: string) {
    this.logger.log('Removing book with id', id);
    const book = await this.findOne(id);
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return this.bookRepository.delete(id);
  }
}
