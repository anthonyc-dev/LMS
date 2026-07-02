import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateFineDto } from './dto/create-fine.dto';
import { UpdateFineDto } from './dto/update-fine.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fine } from './entities/fine.entity';
import { Borrowing } from '../borrowings/entities/borrowing.entity';

@Injectable()
export class FinesService {
  private readonly logger = new Logger(FinesService.name);

  constructor(
    @InjectRepository(Fine)
    private readonly fineRepository: Repository<Fine>,
    @InjectRepository(Borrowing)
    private readonly borrowingRepository: Repository<Borrowing>,
  ) {}

  async create(createFineDto: CreateFineDto) {
    this.logger.log('Creating fine', createFineDto);

    const borrowing = await this.borrowingRepository.findOne({
      where: { id: createFineDto.borrowingId },
    });

    if (!borrowing) {
      throw new NotFoundException('Borrowing record not found');
    }

    const fine = this.fineRepository.create(createFineDto);
    return await this.fineRepository.save(fine);
  }

  async findAll() {
    this.logger.log('Finding all fines');
    return await this.fineRepository.find({
      relations: {
        borrowing: {
          user: true,
          bookCopy: {
            book: true,
          },
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    this.logger.log(`Finding fine with id ${id}`);
    const fine = await this.fineRepository.findOne({
      where: { id },
      relations: {
        borrowing: {
          user: true,
          bookCopy: {
            book: true,
          },
        },
      },
    });

    if (!fine) {
      throw new NotFoundException(`Fine with ID ${id} not found`);
    }

    return fine;
  }

  async update(id: string, updateFineDto: UpdateFineDto) {
    this.logger.log(`Updating fine with id ${id}`, updateFineDto);

    const fine = await this.fineRepository.findOneBy({ id });
    if (!fine) {
      throw new NotFoundException(`Fine with ID ${id} not found`);
    }

    await this.fineRepository.update(id, updateFineDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    this.logger.log(`Removing fine with id ${id}`);

    const fine = await this.fineRepository.findOneBy({ id });
    if (!fine) {
      throw new NotFoundException(`Fine with ID ${id} not found`);
    }

    await this.fineRepository.delete(id);
    return {
      message: 'Fine deleted successfully',
    };
  }
}
