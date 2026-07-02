import { Test, TestingModule } from '@nestjs/testing';
import { ShelfSectionsService } from './shelf-sections.service';

describe('ShelfSectionsService', () => {
  let service: ShelfSectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShelfSectionsService],
    }).compile();

    service = module.get<ShelfSectionsService>(ShelfSectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
