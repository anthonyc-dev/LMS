import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VisitsService } from './visits.service';
import { Visit } from './entities/visit.entity';
import { User } from '../../identity/users/entities/user.entity';

describe('VisitsService', () => {
  let service: VisitsService;
  const repository = { findOne: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        VisitsService,
        { provide: getRepositoryToken(Visit), useValue: repository },
        { provide: getRepositoryToken(User), useValue: {} },
      ],
    }).compile();
    service = module.get(VisitsService);
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
      'Visit with ID missing not found',
    );
  });
});
