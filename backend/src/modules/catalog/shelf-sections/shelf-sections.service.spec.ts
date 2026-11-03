import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShelfSectionsService } from './shelf-sections.service';
import { ShelfSection } from './entities/shelf-section.entity';

describe('ShelfSectionsService', () => {
  let service: ShelfSectionsService;
  const repository = { findOne: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ShelfSectionsService,
        { provide: getRepositoryToken(ShelfSection), useValue: repository },
      ],
    }).compile();
    service = module.get(ShelfSectionsService);
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
      'Shelf section with ID missing not found',
    );
  });
});
