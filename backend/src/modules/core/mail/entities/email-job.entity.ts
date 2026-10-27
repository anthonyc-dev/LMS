import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('email_jobs')
@Index(['status', 'nextAttemptAt'])
export class EmailJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  payload: string | null;

  @Column({ default: 'pending' })
  status: string;

  @Column({ default: 0 })
  attempts: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  nextAttemptAt: Date;

  @Column({ type: 'varchar', nullable: true })
  lastError: string | null;

  @Column({ type: 'varchar', nullable: true })
  providerId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
