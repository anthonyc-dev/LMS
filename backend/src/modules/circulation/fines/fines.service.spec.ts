import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateFineDto } from './dto/create-fine.dto';
import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { FinesService } from './fines.service';
import { Fine, FineStatus } from './entities/fine.entity';
import { Borrowing } from '../borrowings/entities/borrowing.entity';

describe('FinesService', () => {
  const fine = { id: 'fine-id', status: FineStatus.UNPAID } as Fine;
  let currentFine: Fine | null;
  let findOne: jest.Mock<Promise<Fine | null>, []>;
  let save: jest.Mock<Promise<Fine>, [Fine]>;
  let service: FinesService;

  beforeEach(() => {
    currentFine = fine;
    findOne = jest.fn<Promise<Fine | null>, []>(() =>
      Promise.resolve(currentFine),
    );
    save = jest.fn<Promise<Fine>, [Fine]>((value) => Promise.resolve(value));
    const manager = {
      getRepository: () => ({ findOne, save }),
    };
    const fineRepository = {
      manager: {
        transaction: <T>(
          action: (transactionManager: typeof manager) => Promise<T>,
        ): Promise<T> => action(manager),
      },
    };
    service = new FinesService(
      fineRepository as unknown as Repository<Fine>,
      {} as Repository<Borrowing>,
    );
  });

  it('marks an unpaid fine paid with payment timestamp', async () => {
    await service.markPaid(fine.id);
    const [[savedFine]] = save.mock.calls;
    expect(savedFine.status).toBe(FineStatus.PAID);
    expect(savedFine.paidAt).toBeInstanceOf(Date);
  });

  it('does not pay an already settled fine twice', async () => {
    currentFine = { ...fine, status: FineStatus.PAID };
    await expect(service.markPaid(fine.id)).rejects.toThrow(ConflictException);
    expect(save).not.toHaveBeenCalled();
  });
});

describe('Fine type validation', () => {
  it.each(['OVERDUE', 'NO COVER', 'DAMAGED', 'LOST'])(
    'accepts %s without conflating fine types',
    async (type) => {
      const dto = plainToInstance(CreateFineDto, {
        borrowingId: '00000000-0000-4000-8000-000000000001',
        type,
        status: 'UNPAID',
        amount: 50,
      });
      await expect(validate(dto)).resolves.toHaveLength(0);
    },
  );
});
