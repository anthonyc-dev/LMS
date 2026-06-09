import { Injectable } from '@nestjs/common';
import { CreateShelfSectionDto } from './dto/create-shelf-section.dto';
import { UpdateShelfSectionDto } from './dto/update-shelf-section.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ShelfSection } from './entities/shelf-section.entity';
import { Repository } from 'typeorm';
import { Shelf } from '../shelves/entities/shelf.entity';

@Injectable()
export class ShelfSectionsService {
  constructor(
    @InjectRepository(ShelfSection)
    private readonly shelfSectionRepository: Repository<ShelfSection>,
  ) {}

  async create(createShelfSectionDto: CreateShelfSectionDto) {
    const shelfSection = this.shelfSectionRepository.create({
      name: createShelfSectionDto.name,
      shelf: { id: createShelfSectionDto.shelfId },
    });
    return this.shelfSectionRepository.save(shelfSection);
  }

  async findAll() {
    const shelfSections = await this.shelfSectionRepository.find({
      relations: { shelf: true, bookCopies: true },
    });
    if (!shelfSections) {
      throw new Error('No shelf sections found');
    }
    return shelfSections;
  }

  async findOne(id: string): Promise<ShelfSection> {
    const shelfSection = await this.shelfSectionRepository.findOne({
      where: { id },
      relations: { shelf: true, bookCopies: true },
    });
    if (!shelfSection) {
      throw new Error(`Shelf section with ID ${id} not found`);
    }
    return shelfSection;
  }

  async update(
    id: string,
    updateShelfSectionDto: UpdateShelfSectionDto,
  ): Promise<ShelfSection> {
    const shelfSection = await this.findOne(id);
    if (updateShelfSectionDto.name !== undefined) {
      shelfSection.name = updateShelfSectionDto.name;
    }
    if (updateShelfSectionDto.shelfId !== undefined) {
      shelfSection.shelf = { id: updateShelfSectionDto.shelfId } as Shelf;
    }
    return this.shelfSectionRepository.save(shelfSection);
  }

  async remove(id: string): Promise<void> {
    await this.shelfSectionRepository.delete(id);
  }
}
