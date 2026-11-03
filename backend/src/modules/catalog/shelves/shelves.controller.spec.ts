import { ThrottlerGuard } from '@nestjs/throttler';
import { Test, TestingModule } from '@nestjs/testing';
import { ShelvesController } from './shelves.controller';
import { ShelvesService } from './shelves.service';

describe('ShelvesController', () => {
  let controller: ShelvesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShelvesController],
      providers: [{ provide: ShelvesService, useValue: {} }],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ShelvesController>(ShelvesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
