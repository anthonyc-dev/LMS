import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Visit } from './entities/visit.entity';
import { Repository } from 'typeorm';
import { VisitStatus } from 'src/common/enums/enum.enums';
import { User } from '../users/entities/user.entity';

@Injectable()
export class VisitsService {
  private readonly logger = new Logger(VisitsService.name);

  constructor(
    @InjectRepository(Visit)
    private visitRepository: Repository<Visit>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async scan(barcode: string) {
    this.logger.log(`Scanning barcode/ID: ${barcode}`);
    const user = await this.userRepository.findOne({
      where: [{ barcode }, { schoolId: barcode }],
    });

    if (!user) {
      throw new NotFoundException(`User with barcode/ID ${barcode} not found`);
    }

    // Check for an active visit
    const activeVisit = await this.visitRepository.findOne({
      where: {
        user: { id: user.id },
        status: VisitStatus.INSIDE,
      },
      order: { timeIn: 'DESC' },
    });

    if (activeVisit) {
      // User is inside, mark as exited
      activeVisit.status = VisitStatus.EXITED;
      activeVisit.timeOut = new Date();
      await this.visitRepository.save(activeVisit);
      return {
        message: 'Exited successfully',
        action: 'EXIT',
        visit: activeVisit,
        user,
      };
    } else {
      // User is outside, mark as inside
      const newVisit = this.visitRepository.create({
        user: { id: user.id },
        status: VisitStatus.INSIDE,
      });
      const savedVisit = await this.visitRepository.save(newVisit);
      return {
        message: 'Entered successfully',
        action: 'ENTER',
        visit: savedVisit,
        user,
      };
    }
  }

  async create(createVisitDto: CreateVisitDto) {
    this.logger.log(`Creating visit for user ${createVisitDto.userId}`);
    const visit = this.visitRepository.create({
      user: { id: createVisitDto.userId },
      status: VisitStatus.INSIDE,
    });
    return this.visitRepository.save(visit);
  }

  findAll() {
    this.logger.log('Finding all visits');
    return this.visitRepository.find({
      relations: {
        user: true,
      },
      order: { timeIn: 'DESC' },
    });
  }

  async findOne(id: string) {
    this.logger.log(`Finding visit with id ${id}`);
    const visit = await this.visitRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!visit) {
      throw new NotFoundException(`Visit with ID ${id} not found`);
    }
    return visit;
  }

  async update(id: string, updateVisitDto: UpdateVisitDto) {
    this.logger.log(`Updating visit with id ${id}`);

    // Automatically populate timeOut when marking as EXITED
    if (
      updateVisitDto.status === VisitStatus.EXITED &&
      !updateVisitDto.timeOut
    ) {
      updateVisitDto.timeOut = new Date().toISOString();
    }

    await this.visitRepository.update(id, updateVisitDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    this.logger.log(`Removing visit with id ${id}`);
    return this.visitRepository.delete(id);
  }
}
