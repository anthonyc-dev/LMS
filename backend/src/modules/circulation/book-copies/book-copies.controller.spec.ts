import { ThrottlerGuard } from '@nestjs/throttler';
import { Test, TestingModule } from '@nestjs/testing';
import { BookCopiesController } from './book-copies.controller';
import { BookCopiesService } from './book-copies.service';

describe('BookCopiesController', () => {
  let controller: BookCopiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookCopiesController],
      providers: [{ provide: BookCopiesService, useValue: {} }],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BookCopiesController>(BookCopiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
