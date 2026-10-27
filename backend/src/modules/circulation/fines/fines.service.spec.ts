import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { FinesService } from './fines.service';
import { Fine, FineStatus } from './entities/fine.entity';
import { Borrowing } from '../borrowings/entities/borrowing.entity';

describe('FinesService', () => {
  const fine = { id: 'fine-id', status: FineStatus.UNPAID } as Fine;
  let findOne: jest.Mock;
  let save: jest.Mock;
  let service: FinesService;

  beforeEach(() => {
    findOne = jest.fn().mockResolvedValue(fine);
    save = jest.fn().mockImplementation(async (value: Fine) => value);
    const fineRepository = {
      manager: {
        transaction: async (
          action: (manager: { getRepository: () => unknown }) => unknown,
        ) => action({ getRepository: () => ({ findOne, save }) }),
      },
    };
    service = new FinesService(
      fineRepository as unknown as Repository<Fine>,
      {} as Repository<Borrowing>,
    );
  });

  it('marks an unpaid fine paid with payment timestamp', async () => {
    await service.markPaid(fine.id);
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ status: FineStatus.PAID, paidAt: expect.any(Date) }),
    );
  });

  it('does not pay an already settled fine twice', async () => {
    findOne.mockResolvedValue({ ...fine, status: FineStatus.PAID });
    await expect(service.markPaid(fine.id)).rejects.toThrow(ConflictException);
    expect(save).not.toHaveBeenCalled();
  });
});
