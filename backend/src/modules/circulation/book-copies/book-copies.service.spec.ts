import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BookCopiesService } from './book-copies.service';
import { BookCopy } from './entities/book-copy.entity';

describe('BookCopiesService', () => {
  let service: BookCopiesService;
  const repository = { findOne: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        BookCopiesService,
        { provide: getRepositoryToken(BookCopy), useValue: repository },
      ],
    }).compile();
    service = module.get(BookCopiesService);
  });

  it('returns the requested record', async () => {
    const record = { id: 'record-id' };
    repository.findOne.mockResolvedValue(record);
    await expect(service.findOne('record-id')).resolves.toEqual(record);
    expect(repository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'record-id' } }),
    );
  });

  it('reports missing records', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(
      'Book copy with ID missing not found',
    );
  });
});
