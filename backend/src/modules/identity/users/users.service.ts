import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { User } from './entities/user.entity';
import { Session } from '../auth/entities/session.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';
import { normalizeIp } from 'src/common/utils/normalizedIp.util';
import { MailService } from '../../core/mail/mail.service';
import { NotificationsGateway } from '../../core/notifications/notifications.gateway';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { randomBytes } from 'crypto';
import cloudinary from 'src/config/cloudinary';
import * as bwipjs from 'bwip-js';
import { BorrowingStatus } from 'src/common/enums/enum.enums';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    private readonly mailService: MailService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(userData: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user: ${userData.email}`);

    await this.assertAvailableIdentity(userData);

    const user = this.usersRepository.create(userData);

    if (!user.avatarUrl) {
      user.avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`;
    }

    user.barcode = await this.generateBarcode(user.schoolId);

    return this.saveUser(user);
  }

  async createAdminUser(
    userData: CreateAdminUserDto,
    ipAddress: string,
  ): Promise<User> {
    this.logger.log(`Creating user: ${userData.email}`);

    await this.assertAvailableIdentity(userData);

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

    if (!user.avatarUrl) {
      user.avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`;
    }

    user.barcode = await this.generateBarcode(user.schoolId);

    const htmlContent =
      '<p>Your LMS library account has been created.</p>' +
      '<p>Your temporary password is: <strong>' +
      generatedPassword +
      '</strong></p>' +
      '<p>Sign in and change this password immediately. Keep it private.</p>';

    const savedUser = await this.usersRepository.manager.transaction(
      async (manager) => {
        const saved = await this.saveUser(user, manager.getRepository(User));
        await this.mailService.queue(manager, {
          kind: 'account',
          to: saved.email,
          subject: 'Account Created Successfully - Password',
          html: htmlContent,
        });
        return saved;
      },
    );

    return savedUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.log(`Finding user by email: ${email}`);
    return this.usersRepository.findOne({
      where: { email },
      relations: ['borrowings'],
    });
  }

  async findById(id: string): Promise<User | null> {
    this.logger.log(`Finding user by id: ${id}`);
    return this.usersRepository.findOne({
      where: { id },
      relations: ['borrowings'],
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status: string = 'active',
  ) {
    this.logger.log(`Fetching all users: page ${page}, limit ${limit}`);

    const query = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.borrowings', 'borrowing')
      .leftJoinAndSelect('borrowing.bookCopy', 'bookCopy')
      .leftJoinAndSelect('bookCopy.book', 'book')
      .leftJoinAndSelect('borrowing.fines', 'fine')
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status === 'deactivated')
      query.withDeleted().andWhere('user.deletedAt IS NOT NULL');
    const [users, total] = await query.getManyAndCount();

    const data = users.map((user) => {
      const activeBorrowingsCount = user.borrowings
        ? user.borrowings.filter(
            (borrow) =>
              borrow.status === BorrowingStatus.BORROWED ||
              borrow.status === BorrowingStatus.OVERDUE,
          ).length
        : 0;

      return {
        ...plainToInstance(UserResponseDto, user, {
          excludeExtraneousValues: true,
        }),
        deletedAt: user.deletedAt,
        activeBorrowingsCount,
        borrowingsCount: user.borrowings?.length || 0,
        borrowings:
          user.borrowings?.map((borrowing) => ({
            id: borrowing.id,
            bookCopyId: borrowing.bookCopyId,
            borrowDate: borrowing.borrowDate,
            dueDate: borrowing.dueDate,
            returnedDate: borrowing.returnedDate,
            status: borrowing.status,
            extendedCount: borrowing.extendedCount,

            book: borrowing.bookCopy
              ? {
                  id: borrowing.bookCopy.book?.id,
                  title: borrowing.bookCopy.book?.title,
                  isbn: borrowing.bookCopy.book?.isbn,
                  status: borrowing.bookCopy.status,
                  condition: borrowing.bookCopy.condition,
                }
              : null,
            fines:
              borrowing.fines?.map((fine) => ({
                id: fine.id,
                type: fine.type,
                status: fine.status,
                amount: fine.amount,
                reason: fine.reason,
                paidAt: fine.paidAt,
              })) || [],
          })) || [],
      };
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

    const updateData: Partial<User> = { ...userData };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    if (updateData.schoolId) {
      updateData.barcode = await this.generateBarcode(updateData.schoolId);
    }

    await this.usersRepository.update(id, updateData);
    return this.findById(id);
  }

  async updateProfile(
    id: string,
    updateProfileDto: UpdateProfileDto,
    file?: Express.Multer.File,
  ) {
    this.logger.log(`Updating profile for user: ${id}`);

    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData = { ...updateProfileDto };

    if (file) {
      try {
        const base64Data = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${base64Data}`;
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'student-profile',
        });
        updateData.avatarUrl = result.secure_url;
      } catch (error) {
        this.logger.error('Error uploading avatar to Cloudinary', error);
        // Continue with the rest of the update, or throw an error. Usually we want to throw.
        throw new ConflictException('Failed to upload avatar image');
      }
    }

    if (!updateData.avatarUrl && !user.avatarUrl) {
      const nameForAvatar = updateData.fullName || user.fullName;
      updateData.avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameForAvatar)}&background=random`;
    } else if (updateData.avatarUrl === '') {
      const nameForAvatar = updateData.fullName || user.fullName;
      updateData.avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameForAvatar)}&background=random`;
    }

    await this.usersRepository.update(id, updateData);
    return this.findById(id);
  }

  async changePassword(
    id: string,
    changePasswordDto: import('./dto/change-password.dto').ChangePasswordDto,
  ) {
    this.logger.log(`Changing password for user: ${id}`);
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new ConflictException('Incorrect old password');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.usersRepository.update(id, { password: hashedPassword });

    return { message: 'Password changed successfully' };
  }

  async deactivate(id: string, actorId?: string) {
    if (id === actorId)
      throw new ForbiddenException('You cannot deactivate your own account');
    await this.usersRepository.manager.transaction(async (manager) => {
      const users = manager.getRepository(User);
      const user = await users.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!user) throw new NotFoundException('Active user not found');
      await manager.getRepository(Session).delete({ user: { id } });
      await users.increment({ id }, 'authVersion', 1);
      await users.softDelete(id);
    });
    this.notificationsGateway.disconnectUser(id);
  }

  async restore(id: string) {
    await this.usersRepository.manager.transaction(async (manager) => {
      const users = manager.getRepository(User);
      const user = await users.findOne({
        where: { id },
        withDeleted: true,
        lock: { mode: 'pessimistic_write' },
      });
      if (!user) throw new NotFoundException('User not found');
      if (!user.deletedAt)
        throw new ConflictException('Account is already active');
      await users.restore(id);
      await users.update(id, { failedLoginAttempts: 0, lockoutUntil: null });
    });
    return this.findById(id);
  }

  private async assertAvailableIdentity(data: {
    email: string;
    schoolId: string;
    phoneNumber: string;
  }) {
    const existing = await this.usersRepository.findOne({
      where: [
        { email: data.email },
        { phoneNumber: data.phoneNumber },
        { schoolId: data.schoolId },
      ],
      withDeleted: true,
    });
    if (!existing) return;
    if (existing.deletedAt)
      throw new ConflictException(
        'Account deactivated. Contact the library administrator for account recovery.',
      );
    if (existing.email === data.email)
      throw new ConflictException('Email already exists');
    if (existing.phoneNumber === data.phoneNumber)
      throw new ConflictException('Phone number already exists');
    throw new ConflictException('School ID already exists');
  }

  private async saveUser(
    user: User,
    repository: Repository<User> = this.usersRepository,
  ): Promise<User> {
    try {
      return await repository.save(user);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException(
          'Email, phone number or school ID already exists. Contact the library administrator if your account was deactivated.',
        );
      }
      throw error;
    }
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

  private async generateBarcode(text: string): Promise<string> {
    const normalized = this.normalizeBarcode(text);
    const png = await bwipjs.toBuffer({
      bcid: 'code128',
      text: normalized,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center',
    });
    return `data:image/png;base64,${png.toString('base64')}`;
  }

  private normalizeBarcode(value: string): string {
    return value.trim().toUpperCase();
  }
}
