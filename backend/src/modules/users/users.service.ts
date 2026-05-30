import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import * as bcrypt from 'bcrypt';
import { normalizeIp } from 'src/common/utils/normalizedIp.util';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user: ${userData.email}`);

    const user = this.usersRepository.create(userData);

    return this.usersRepository.save(user);
  }

  async createAdminUser(
    userData: CreateAdminUserDto,
    ipAddress: string,
  ): Promise<User> {
    this.logger.log(`Creating admin user: ${userData.email}`);

    const cleanIp = normalizeIp(ipAddress);

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = this.usersRepository.create({
      ...userData,
      ipAddress: cleanIp,
      password: hashedPassword,
      acceptedTerms: true,
      acceptedAt: new Date(),
    });

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.log(`Finding user by email: ${email}`);
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    this.logger.log(`Finding user by id: ${id}`);
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(page: number = 1, limit: number = 10) {
    this.logger.log(`Fetching all users: page ${page}, limit ${limit}`);
    const [data, total] = await this.usersRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, userData: UpdateUserDto) {
    this.logger.log(`Updating user: ${id}`);

    const updateData = { ...userData };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await this.usersRepository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string) {
    this.logger.log(`Deleting user: ${id}`);
    await this.usersRepository.softDelete(id);
  }

  // ---------- Lockout and failed attempts functions || SOON
  async resetFailedAttempts(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      failedLoginAttempts: 0,
      lockoutUntil: null,
    });
  }

  async incrementFailedAttempts(id: string): Promise<void> {
    await this.usersRepository.increment({ id }, 'failedLoginAttempts', 1);
  }

  async setLockout(id: string, durationMs: number): Promise<void> {
    const lockoutUntil = new Date(Date.now() + durationMs);
    await this.usersRepository.update(id, { lockoutUntil });
  }

  async isLockedOut(id: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) return false;

    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      return true;
    }

    return false;
  }
}
