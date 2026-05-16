import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async create(userData: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user: ${userData.email}`);

    const hashedPassword = await bcrypt.hash(
      userData.password,
      10,
    );

    const user = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
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

  async update(id: string, userData: UpdateUserDto) {
    this.logger.log(`Updating user: ${id}`);
    await this.usersRepository.update(id, userData);
    return this.findById(id);
  }

  async delete(id: string) {
    this.logger.log(`Deleting user: ${id}`);
    await this.usersRepository.softDelete(id);
  }

  // ---------- Lockout and failed attempts functions || SOON
  async resetFailedAttempts(id: string): Promise<void> {
    await this.usersRepository.update(id, { failedLoginAttempts: 0, lockoutUntil: null });
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
