import { Role } from 'src/common/enums/role.enum';
import { Borrowing } from 'src/modules/borrowings/entities/borrowing.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { DepartmentEnum, YearLevelEnum } from 'src/common/enums/enum.enums';

@Entity('users')
@Index(['email'])
@Index(['schoolId'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  schoolId: string;

  @Column({ type: 'text', nullable: true })
  barcode?: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: DepartmentEnum,
    nullable: true,
  })
  department: DepartmentEnum;

  @Column({
    type: 'enum',
    enum: YearLevelEnum,
    nullable: true,
  })
  yearLevel: YearLevelEnum;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.STUDENT,
  })
  role: Role;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ default: false })
  acceptedTerms: boolean;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt: Date;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lockoutUntil: Date | null;

  @OneToMany(() => Borrowing, (borrowing) => borrowing.user)
  borrowings: Borrowing[];

  @Column({ type: 'varchar', nullable: true })
  resetPasswordOtp: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
