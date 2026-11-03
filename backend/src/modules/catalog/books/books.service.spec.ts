jest.mock('src/common/utils/cloudinaryUpload', () => ({
  uploadImageToCloudinary: jest.fn(),
  deleteImageFromCloudinary: jest.fn(),
}));
jest.mock('src/common/utils/cloudinaryPdf', () => ({
  validatePdf: jest.fn(),
  uploadPdfToCloudinary: jest.fn(),
  deletePdfFromCloudinary: jest.fn(),
  pdfReadUrl: jest.fn(() => 'https://example.com/signed.pdf'),
}));
import { BooksService } from './books.service';
import {
  Repository,
  Not,
  IsNull,
  FindManyOptions,
  FindOptionsWhere,
} from 'typeorm';
import { CatalogFormat } from './dto/list-books-query.dto';
import { Book } from './entities/book.entity';
import {
  uploadPdfToCloudinary,
  deletePdfFromCloudinary,
} from 'src/common/utils/cloudinaryPdf';

describe('BooksService eBooks', () => {
  let service: BooksService;
  let repo: {
    findOne: jest.Mock;
    findAndCount: jest.Mock<Promise<unknown>, [FindManyOptions<Book>]>;
    update: jest.Mock;
    manager: { transaction: jest.Mock };
  };
  beforeEach(() => {
    jest.clearAllMocks();
    repo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'book',
        ebookPublicId: 'ebooks/old.pdf',
        bookCopies: [],
      }),
      findAndCount: jest
        .fn<Promise<unknown>, [FindManyOptions<Book>]>()
        .mockResolvedValue([[], 0]),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      manager: {
        transaction: jest.fn((action: (manager: unknown) => Promise<unknown>) =>
          action({ getRepository: () => repo }),
        ),
      },
    };
    jest.mocked(uploadPdfToCloudinary).mockResolvedValue('ebooks/new.pdf');
    jest.mocked(deletePdfFromCloudinary).mockResolvedValue();
    service = new BooksService(repo as unknown as Repository<Book>);
  });
  it('combines format and category filters with every search branch before pagination', async () => {
    repo.findAndCount.mockResolvedValue([
      [{ id: 'digital', ebookFileName: 'history.pdf', bookCopies: [] }],
      13,
    ]);
    const result = await service.findAll(
      2,
      12,
      'History',
      CatalogFormat.EBOOK,
      'category-id',
    );
    const options = repo.findAndCount.mock.calls[0][0];
    expect(options.skip).toBe(12);
    expect(options.take).toBe(12);
    const branches = options.where as FindOptionsWhere<Book>[];
    expect(branches).toHaveLength(4);
    for (const branch of branches)
      expect(branch).toMatchObject({
        ebookFileName: Not(IsNull()),
        categoryId: 'category-id',
      });
    expect(result).toMatchObject({
      total: 13,
      totalPages: 2,
      data: [{ physicalCopies: 0, ebookFileName: 'history.pdf' }],
    });
  });

  it.each([CatalogFormat.PHYSICAL, CatalogFormat.BOTH])(
    'filters %s against actual physical holdings',
    async (format) => {
      await service.findAll(1, 10, undefined, format);
      const options = repo.findAndCount.mock.calls[0][0];
      expect(options.where).toMatchObject({
        bookCopies: { id: Not(IsNull()) },
      });
      if (format === CatalogFormat.BOTH)
        expect(options.where).toMatchObject({ ebookFileName: Not(IsNull()) });
    },
  );

  it('reports physical holdings independently from PDF availability', async () => {
    repo.findOne.mockResolvedValue({
      id: 'hybrid',
      ebookFileName: 'book.pdf',
      bookCopies: [{ status: 'BORROWED' }, { status: 'AVAILABLE' }],
    });
    await expect(service.findOne('hybrid')).resolves.toMatchObject({
      physicalCopies: 2,
      availableCopies: 1,
      ebookFileName: 'book.pdf',
    });
  });

  it('replaces stored reference and deletes old asset only after commit', async () => {
    repo.manager.transaction.mockImplementation(async (action) => {
      const result: unknown = await (
        action as (manager: unknown) => Promise<unknown>
      )({ getRepository: () => repo });
      expect(deletePdfFromCloudinary).not.toHaveBeenCalled();
      return result;
    });
    await service.uploadEbook('book', {
      originalname: 'new.pdf',
    } as Express.Multer.File);
    expect(repo.update).toHaveBeenCalledWith('book', {
      ebookPublicId: 'ebooks/new.pdf',
      ebookFileName: 'new.pdf',
    });
    expect(deletePdfFromCloudinary).toHaveBeenCalledWith('ebooks/old.pdf');
  });
  it('cleans up new upload when DB commit fails and preserves old asset', async () => {
    repo.manager.transaction.mockImplementation(async (action) => {
      await (action as (manager: unknown) => Promise<unknown>)({
        getRepository: () => repo,
      });
      throw new Error('commit failed');
    });
    await expect(
      service.uploadEbook('book', {
        originalname: 'new.pdf',
      } as Express.Multer.File),
    ).rejects.toThrow('commit failed');
    expect(deletePdfFromCloudinary).toHaveBeenCalledWith('ebooks/new.pdf');
    expect(deletePdfFromCloudinary).not.toHaveBeenCalledWith('ebooks/old.pdf');
  });
  it('does not upload for missing book', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(
      service.uploadEbook('missing', {} as Express.Multer.File),
    ).rejects.toThrow('Book not found');
    expect(uploadPdfToCloudinary).not.toHaveBeenCalled();
  });
  it('returns read URL only for books with PDF', async () => {
    await expect(service.readEbook('book')).resolves.toEqual({
      url: 'https://example.com/signed.pdf',
    });
    repo.findOne.mockResolvedValue({ id: 'book', ebookPublicId: null });
    await expect(service.readEbook('book')).rejects.toThrow(
      'eBook PDF not found',
    );
  });
  it('removes reference before deleting stored PDF', async () => {
    await service.removeEbook('book');
    expect(repo.update).toHaveBeenCalledWith('book', {
      ebookPublicId: null,
      ebookFileName: null,
    });
    expect(deletePdfFromCloudinary).toHaveBeenCalledWith('ebooks/old.pdf');
  });
});
