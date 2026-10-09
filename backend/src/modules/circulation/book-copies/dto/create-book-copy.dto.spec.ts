import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CreateBookCopyDto } from './create-book-copy.dto';
import { BulkCreateBookCopyDto } from './bulk-create-book-copy.dto';

describe('Book copy request validation', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });
  const details = {
    status: 'AVAILABLE',
    condition: 'GOOD',
    bookId: '7452f42f-996b-40d0-8a5b-70c0a8354fca',
    purchasePrice: 0,
    acquiredAt: '2026-10-09T00:00:00.000Z',
  };

  it.each([CreateBookCopyDto, BulkCreateBookCopyDto])(
    'rejects UI-only shelfSectionIds for %p',
    async (metatype) => {
      await expect(
        pipe.transform(
          {
            ...details,
            shelfSectionIds: [],
            ...(metatype === BulkCreateBookCopyDto ? { count: 2 } : {}),
          },
          { type: 'body', metatype },
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    },
  );

  it('accepts a single copy with its singular shelf section', async () => {
    const result = (await pipe.transform(
      { ...details, shelfSectionId: '346e4165-71c0-448e-925d-e128852ed676' },
      { type: 'body', metatype: CreateBookCopyDto },
    )) as CreateBookCopyDto;
    expect(result.shelfSectionId).toBe('346e4165-71c0-448e-925d-e128852ed676');
    expect(result.acquiredAt).toBeInstanceOf(Date);
  });

  it('accepts bulk copies without a shelf section', async () => {
    const result = (await pipe.transform(
      { ...details, count: 3 },
      { type: 'body', metatype: BulkCreateBookCopyDto },
    )) as BulkCreateBookCopyDto;
    expect(result.count).toBe(3);
  });
});
