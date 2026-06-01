import { Injectable } from '@nestjs/common';
import { CreateShelfDto } from './dto/create-shelf.dto';
import { UpdateShelfDto } from './dto/update-shelf.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Shelf } from './entities/shelf.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ShelvesService {
  constructor(
    @InjectRepository(Shelf)
    private readonly shelfRepository: Repository<Shelf>,
  ) {}

  //create
  async create(createShelfDto: CreateShelfDto): Promise<Shelf> {
    const shelf = this.shelfRepository.create(createShelfDto);
    return this.shelfRepository.save(shelf);
  }

  async findAll(): Promise<Shelf[]> {
    const shelves = await this.shelfRepository.find({
      // relations: { books: true },
    });
    if (!shelves) {
      throw new Error('No shelves found');
    }
    return shelves;
  }

  async findOne(id: string): Promise<Shelf> {
    const shelf = await this.shelfRepository.findOne({
      where: { id },
      // relations: { books: true },
    });
    if (!shelf) {
      throw new Error(`Shelf with ID ${id} not found`);
    }
    return shelf;
  }

  async update(id: string, updateShelfDto: UpdateShelfDto): Promise<Shelf> {
    const shelf = await this.findOne(id);
    Object.assign(shelf, updateShelfDto);
    return this.shelfRepository.save(shelf);
  }

  async remove(id: string): Promise<void> {
    await this.shelfRepository.delete(id);
  }
}
