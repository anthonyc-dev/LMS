import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShelvesService } from './shelves.service';
import { Shelf } from './entities/shelf.entity';
import { DataSource } from 'typeorm';

describe('ShelvesService', () => {
  let service: ShelvesService;
  const repository = { findOne: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ShelvesService,
        { provide: getRepositoryToken(Shelf), useValue: repository },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();
    service = module.get(ShelvesService);
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
      'Shelf with ID missing not found',
    );
  });
});
