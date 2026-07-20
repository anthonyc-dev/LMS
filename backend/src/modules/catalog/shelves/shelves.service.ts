import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateShelfDto } from './dto/create-shelf.dto';
import { UpdateShelfDto } from './dto/update-shelf.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Shelf } from './entities/shelf.entity';
import { Repository, DataSource } from 'typeorm';
import { ShelfSection } from '../shelf-sections/entities/shelf-section.entity';

@Injectable()
export class ShelvesService {
  constructor(
    @InjectRepository(Shelf)
    private readonly shelfRepository: Repository<Shelf>,

    private readonly dataSource: DataSource,
  ) {}

  //create
  async create(createShelfDto: CreateShelfDto): Promise<Shelf> {
    return this.dataSource.transaction(async (manager) => {
      const shelf = manager.create(Shelf, {
        name: createShelfDto.name,
        code: createShelfDto.code,
        description: createShelfDto.description,
        floor: createShelfDto.floor,
      });

      const savedShelf = await manager.save(shelf);

      if (createShelfDto.sections?.length) {
        const sections = createShelfDto.sections.map((s) =>
          manager.create(ShelfSection, {
            name: s.name,
            shelf: savedShelf,
          }),
        );

        await manager.save(ShelfSection, sections);
      }

      const result = await manager.findOne(Shelf, {
        where: { id: savedShelf.id },
        relations: {
          sections: true,
        },
      });

      if (!result) {
        throw new NotFoundException(
          `Shelf with ID ${savedShelf.id} not found after creation`,
        );
      }

      return result;
    });
  }

  async findAll(): Promise<Shelf[]> {
    const shelves = await this.shelfRepository.find({
      relations: { sections: { bookCopies: true } },
      order: { createdAt: 'DESC', sections: { name: 'ASC' } },
    });
    if (!shelves) {
      throw new Error('No shelves found');
    }
    return shelves;
  }

  async findOne(id: string): Promise<Shelf> {
    const shelf = await this.shelfRepository.findOne({
      where: { id },
      relations: { sections: { bookCopies: true } },
      order: { sections: { name: 'ASC' } },
    });
    if (!shelf) {
      throw new Error(`Shelf with ID ${id} not found`);
    }
    return shelf;
  }

  async update(id: string, updateShelfDto: UpdateShelfDto): Promise<Shelf> {
    return this.dataSource.transaction(async (manager) => {
      const shelfRepo = manager.getRepository(Shelf);
      const sectionRepo = manager.getRepository(ShelfSection);

      // 1. Load shelf with sections + bookCopies
      const shelf = await shelfRepo.findOne({
        where: { id },
        relations: {
          sections: {
            bookCopies: true,
          },
        },
      });

      if (!shelf) {
        throw new NotFoundException(`Shelf with ID ${id} not found`);
      }

      // 2. Update shelf fields safely
      Object.assign(shelf, {
        name: updateShelfDto.name ?? shelf.name,
        code: updateShelfDto.code ?? shelf.code,
        description: updateShelfDto.description ?? shelf.description,
        floor: updateShelfDto.floor ?? shelf.floor,
      });

      await shelfRepo.save(shelf);

      // 3. If sections update is requested
      if (updateShelfDto.sections) {
        const existingSections = shelf.sections;

        const incomingNames = updateShelfDto.sections.map((s) => s.name);

        // 3.1 Detect unsafe deletions (sections with books being removed)
        const blockedSections = existingSections.filter(
          (section) =>
            section.bookCopies?.length > 0 &&
            !incomingNames.includes(section.name),
        );

        if (blockedSections.length > 0) {
          throw new BadRequestException(
            `Cannot remove sections with books: ${blockedSections
              .map((s) => s.name)
              .join(', ')}`,
          );
        }

        // 3.2 Delete only safe sections (empty + removed ones)
        const safeToDelete = existingSections.filter(
          (section) =>
            section.bookCopies?.length === 0 &&
            !incomingNames.includes(section.name),
        );

        if (safeToDelete.length > 0) {
          await sectionRepo.delete(safeToDelete.map((s) => s.id));
        }

        // 3.3 Add new sections (not existing yet)
        const newSections = updateShelfDto.sections
          .filter((s) => !existingSections.some((e) => e.name === s.name))
          .map((s) =>
            sectionRepo.create({
              name: s.name,
              shelf: { id },
            }),
          );

        if (newSections.length > 0) {
          await sectionRepo.save(newSections);
        }
      }

      // 4. Return updated shelf with full relations
      const updated = await shelfRepo.findOne({
        where: { id },
        relations: {
          sections: true,
        },
      });

      if (!updated) {
        throw new NotFoundException(`Shelf not found after update`);
      }

      return updated;
    });
  }

  async remove(id: string): Promise<void> {
    const shelf = await this.shelfRepository.findOne({
      where: { id },
      relations: {
        sections: {
          bookCopies: true,
        },
      },
    });

    if (!shelf) {
      throw new NotFoundException(`Shelf not found`);
    }

    const hasSections = shelf.sections.length > 0;
    const hasBookCopies = shelf.sections.some((s) => s.bookCopies?.length > 0);

    if (hasSections || hasBookCopies) {
      throw new BadRequestException(
        `Cannot delete shelf with existing sections or book copies`,
      );
    }

    await this.shelfRepository.delete(id);
  }
}
