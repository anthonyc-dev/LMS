import { ThrottlerGuard } from '@nestjs/throttler';
import { Test, TestingModule } from '@nestjs/testing';
import { FinesController } from './fines.controller';
import { FinesService } from './fines.service';

describe('FinesController', () => {
  let controller: FinesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinesController],
      providers: [{ provide: FinesService, useValue: {} }],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<FinesController>(FinesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
