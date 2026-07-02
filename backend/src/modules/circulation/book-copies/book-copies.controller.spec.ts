import { Test, TestingModule } from '@nestjs/testing';
import { BookCopiesController } from './book-copies.controller';
import { BookCopiesService } from './book-copies.service';

describe('BookCopiesController', () => {
  let controller: BookCopiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookCopiesController],
      providers: [BookCopiesService],
    }).compile();

    controller = module.get<BookCopiesController>(BookCopiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
