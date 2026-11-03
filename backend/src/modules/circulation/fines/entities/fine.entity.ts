import { Borrowing } from 'src/modules/circulation/borrowings/entities/borrowing.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum FineStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  WAIVED = 'WAIVED',
}

export enum FineType {
  OVERDUE = 'OVERDUE',
  NO_COVER = 'NO COVER',
  DAMAGED = 'DAMAGED',
  LOST = 'LOST',
}

@Entity('fines')
export class Fine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  borrowingId: string;

  @ManyToOne(() => Borrowing, (borrowing) => borrowing.fines, {
    onDelete: 'CASCADE',
  })
  borrowing: Borrowing;

  @Column({ type: 'enum', enum: FineType })
  type: FineType;

  @Column({ type: 'enum', enum: FineStatus, default: FineStatus.UNPAID })
  status: FineStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true })
  paidAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
