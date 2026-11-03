import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  validatePdf,
  uploadPdfToCloudinary,
  deletePdfFromCloudinary,
  pdfReadUrl,
} from 'src/common/utils/cloudinaryPdf';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';
import { CatalogFormat } from './dto/list-books-query.dto';
import {
  Repository,
  ILike,
  FindManyOptions,
  FindOptionsWhere,
  Not,
  IsNull,
} from 'typeorm';
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from 'src/common/utils/cloudinaryUpload';
import { InjectRepository } from '@nestjs/typeorm';
import { BookCopyStatus } from 'src/common/enums/enum.enums';

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async create(createBookDto: CreateBookDto, file?: Express.Multer.File) {
    this.logger.log('Creating book', createBookDto);

    const existingBook = await this.bookRepository.findOne({
      where: { isbn: createBookDto.isbn },
    });

    if (existingBook) {
      throw new ConflictException(
        `Book with ISBN ${createBookDto.isbn} already exists`,
      );
    }

    try {
      // Upload cover image if provided
      if (file) {
        const coverImageUrl = await uploadImageToCloudinary(
          file,
          'book-covers',
        );

        if (createBookDto.coverImage) {
          try {
            await deleteImageFromCloudinary(createBookDto.coverImage);
          } catch (deleteError) {
            this.logger.error('Failed to delete old cover image', deleteError);
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

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    format: CatalogFormat = CatalogFormat.ALL,
    categoryId?: string,
  ) {
    this.logger.log(
      `Finding all books (page: ${page}, limit: ${limit}, search: ${search})`,
    );

    const filters: FindOptionsWhere<Book> = {};
    if (format === CatalogFormat.EBOOK || format === CatalogFormat.BOTH)
      filters.ebookFileName = Not(IsNull());
    if (format === CatalogFormat.PHYSICAL || format === CatalogFormat.BOTH)
      filters.bookCopies = { id: Not(IsNull()) };
    if (categoryId) filters.categoryId = categoryId;
    const skip = (page - 1) * limit;
    const findOptions: FindManyOptions<Book> = {
      where: filters,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: {
        category: true,
        bookCopies: {
          shelfSection: {
            shelf: true,
          },
        },
      },
    };

    if (search && search.trim() !== '') {
      findOptions.where = [
        { ...filters, title: ILike(`%${search}%`) },
        { ...filters, author: ILike(`%${search}%`) },
        { ...filters, isbn: ILike(`%${search}%`) },
        {
          ...filters,
          category: {
            name: ILike(`%${search}%`),
          },
        },
      ];
    }

    const [books, total] = await this.bookRepository.findAndCount(findOptions);

    const data = books.map((book) => {
      const availableCopies =
        book.bookCopies?.filter(
          (copy) => copy.status === BookCopyStatus.AVAILABLE,
        ).length || 0;

      const availabilityLabel =
        availableCopies > 0
          ? `${availableCopies} copies available`
          : 'No copies available';

      const locations = [
        ...new Set(
          book.bookCopies
            .filter((copy) => copy.status === BookCopyStatus.AVAILABLE)
            .map((copy) =>
              copy.shelfSection?.shelf?.name && copy.shelfSection?.name
                ? `${copy.shelfSection.shelf.name} → ${copy.shelfSection.name}`
                : null,
            )
            .filter(Boolean),
        ),
      ];
      return {
        ...book,
        physicalCopies: book.bookCopies?.length || 0,
        availableCopies,
        availabilityLabel,
        status:
          availableCopies > 0
            ? BookCopyStatus.AVAILABLE
            : BookCopyStatus.UNAVAILABLE,
        locations: locations.length > 0 ? locations : ['Unavailable'],
      };
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    this.logger.log('Finding book with id', id);
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: {
        category: true,
        bookCopies: {
          shelfSection: {
            shelf: true,
          },
        },
      },
    });
    if (!book) {
      return null;
    }

    const availableCopies = book.bookCopies.filter(
      (copy) => copy.status === BookCopyStatus.AVAILABLE,
    ).length;

    const availabilityLabel =
      availableCopies > 0
        ? `${availableCopies} copies available`
        : 'No copies available';

    const locations = [
      ...new Set(
        book.bookCopies
          .filter((copy) => copy.status === BookCopyStatus.AVAILABLE)
          .map((copy) =>
            copy.shelfSection?.shelf?.name && copy.shelfSection?.name
              ? `${copy.shelfSection.shelf.name} → ${copy.shelfSection.name}`
              : null,
          )
          .filter(Boolean),
      ),
    ];

    return {
      ...book,
      physicalCopies: book.bookCopies?.length || 0,
      availableCopies,
      availabilityLabel,
      status:
        availableCopies > 0
          ? BookCopyStatus.AVAILABLE
          : BookCopyStatus.UNAVAILABLE,
      locations: locations.length > 0 ? locations : ['Unavailable'],
    };
  }

  async update(
    id: string,
    updateBookDto: UpdateBookDto,
    file?: Express.Multer.File,
  ) {
    this.logger.log('Updating book with id', id);
    const book = await this.findOne(id);
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    if (file) {
      const coverImageUrl = await uploadImageToCloudinary(file, 'book-covers');
      if (book.coverImage) {
        deleteImageFromCloudinary(book.coverImage).catch((err) =>
          this.logger.error(
            'Failed to delete old cover image from Cloudinary',
            err,
          ),
        );
      }
      updateBookDto.coverImage = coverImageUrl;
    }

    await this.bookRepository.update(id, updateBookDto);
    return this.findOne(id);
  }

  async uploadEbook(id: string, file?: Express.Multer.File) {
    validatePdf(file);
    await this.replaceEbook(id, file);
    return this.findOne(id);
  }

  async removeEbook(id: string) {
    await this.replaceEbook(id);
    return { message: 'eBook removed' };
  }

  async readEbook(id: string) {
    const book = await this.bookRepository.findOne({
      where: { id },
      select: { id: true, ebookPublicId: true },
    });
    if (!book?.ebookPublicId)
      throw new NotFoundException('eBook PDF not found');
    return { url: pdfReadUrl(book.ebookPublicId) };
  }

  private async cleanupEbook(publicId: string) {
    try {
      await deletePdfFromCloudinary(publicId);
    } catch {
      this.logger.error('Failed to remove Cloudinary eBook asset: ' + publicId);
    }
  }

  private async replaceEbook(id: string, file?: Express.Multer.File) {
    let uploaded: string | null = null;
    let previous: string | null = null;
    try {
      await this.bookRepository.manager.transaction(async (manager) => {
        const repository = manager.getRepository(Book);
        const book = await repository.findOne({
          where: { id },
          select: { id: true, ebookPublicId: true },
          lock: { mode: 'pessimistic_write' },
        });
        if (!book) throw new NotFoundException('Book not found');
        previous = book.ebookPublicId;
        if (file) uploaded = await uploadPdfToCloudinary(file);
        await repository.update(id, {
          ebookPublicId: uploaded,
          ebookFileName: file ? file.originalname.slice(0, 255) : null,
        });
      });
    } catch (error) {
      if (uploaded) await this.cleanupEbook(uploaded);
      throw error;
    }
    if (previous) await this.cleanupEbook(previous);
  }

  async remove(id: string) {
    let previous: string | null = null;
    const result = await this.bookRepository.manager.transaction(
      async (manager) => {
        const repository = manager.getRepository(Book);
        const book = await repository.findOne({
          where: { id },
          select: { id: true, ebookPublicId: true },
          lock: { mode: 'pessimistic_write' },
        });
        if (!book) throw new NotFoundException('Book not found');
        previous = book.ebookPublicId;
        return repository.delete(id);
      },
    );
    if (previous) await this.cleanupEbook(previous);
    return result;
  }
}
