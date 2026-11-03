import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { Inventory } from './entities/inventory.entity';

describe('InventoryService', () => {
  let service: InventoryService;
  const repository = { findOne: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: getRepositoryToken(Inventory), useValue: repository },
      ],
    }).compile();
    service = module.get(InventoryService);
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
      'Inventory not found',
    );
  });
});
