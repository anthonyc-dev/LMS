import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Session } from '../auth/entities/session.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import * as bcrypt from 'bcrypt';
import { normalizeIp } from 'src/common/utils/normalizedIp.util';
import * as nodemailer from 'nodemailer';
import { randomBytes, randomInt } from 'crypto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async create(userData: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user: ${userData.email}`);

    // Check if any user already exists with the same email, phone number, or school ID
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email: userData.email },
        { phoneNumber: userData.phoneNumber },
        { schoolId: userData.schoolId },
      ],
    });

    if (existingUser) {
      if (existingUser.email === userData.email) {
        throw new ConflictException('Email already exists');
      }

      if (existingUser.phoneNumber === userData.phoneNumber) {
        throw new ConflictException('Phone number already exists');
      }

      if (existingUser.schoolId === userData.schoolId) {
        throw new ConflictException('School ID already exists');
      }

      throw new ConflictException('User already exists');
    }

    const user = this.usersRepository.create(userData);

    return this.usersRepository.save(user);
  }

  async createAdminUser(
    userData: CreateAdminUserDto,
    ipAddress: string,
  ): Promise<User> {
    this.logger.log(`Creating user: ${userData.email}`);

    // Check if any user already exists with the same email, phone number, or school ID
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email: userData.email },
        { phoneNumber: userData.phoneNumber },
        { schoolId: userData.schoolId },
      ],
    });

    if (existingUser?.email === userData.email) {
      throw new ConflictException('Email already exists');
    }

    if (existingUser?.phoneNumber === userData.phoneNumber) {
      throw new ConflictException('Phone number already exists');
    }

    if (existingUser?.schoolId === userData.schoolId) {
      throw new ConflictException('School ID already exists');
    }
    const cleanIp = normalizeIp(ipAddress);

    const generatedPassword = randomBytes(6).toString('hex');
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const user = this.usersRepository.create({
      ...userData,
      ipAddress: cleanIp,
      password: hashedPassword,
      acceptedTerms: true,
      acceptedAt: new Date(),
    });

    const savedUser = await this.usersRepository.save(user);

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; padding: 20px;">
    <div style="max-width: 500px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Account Created Successfully</h2>
        <p style="color: #666; font-size: 16px;">Your account has been created successfully. Your temporary password is:</p>
        <div style="background: #007bff; color: white; font-size: 32px; font-weight: bold; 
            padding: 15px; text-align: center; border-radius: 5px; letter-spacing: 5px; margin: 20px 0;">
            ${generatedPassword}
        </div>
        <p style="color: #666; font-size: 14px;">Please login and change your password as soon as possible.</p>
    </div>
</body>
</html>`;

    await this.transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: savedUser.email,
      subject: 'Account Created Successfully - Password',
      html: htmlContent,
    });

    return savedUser;
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
    await this.sessionRepository.delete({ user: { id } });
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
