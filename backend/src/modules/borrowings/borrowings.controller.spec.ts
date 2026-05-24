import { Test, TestingModule } from '@nestjs/testing';
import { BorrowingsController } from './borrowings.controller';
import { BorrowingsService } from './borrowings.service';

describe('BorrowingsController', () => {
  let controller: BorrowingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BorrowingsController],
      providers: [BorrowingsService],
    }).compile();

    controller = module.get<BorrowingsController>(BorrowingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
