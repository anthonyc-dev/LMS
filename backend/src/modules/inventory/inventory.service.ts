import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Inventory } from './entities/inventory.entity';

import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) { }

  async create(createInventoryDto: CreateInventoryDto) {
    const inventory =
      this.inventoryRepository.create(createInventoryDto);

    return await this.inventoryRepository.save(inventory);
  }

  async findAll() {
    return await this.inventoryRepository.find({
      relations: ['book'],
    });
  }

  async findOne(id: string) {
    const inventory =
      await this.inventoryRepository.findOne({
        where: { id },
        relations: ['book'],
      });

    if (!inventory) {
      throw new NotFoundException(
        'Inventory not found',
      );
    }

    return inventory;
  }

  async update(
    id: string,
    updateInventoryDto: UpdateInventoryDto,
  ) {
    const inventory = await this.findOne(id);

    Object.assign(inventory, updateInventoryDto);

    return await this.inventoryRepository.save(
      inventory,
    );
  }

  async remove(id: string) {
    const inventory = await this.findOne(id);

    return await this.inventoryRepository.remove(
      inventory,
    );
  }
}