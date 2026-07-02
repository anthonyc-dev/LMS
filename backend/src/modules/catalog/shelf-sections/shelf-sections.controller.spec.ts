import { Test, TestingModule } from '@nestjs/testing';
import { ShelfSectionsController } from './shelf-sections.controller';
import { ShelfSectionsService } from './shelf-sections.service';

describe('ShelfSectionsController', () => {
  let controller: ShelfSectionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShelfSectionsController],
      providers: [ShelfSectionsService],
    }).compile();

    controller = module.get<ShelfSectionsController>(ShelfSectionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
