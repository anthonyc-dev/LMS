import { VisitStatus } from 'src/common/enums/enum.enums';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('library_visits')
export class Visit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.visits)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: VisitStatus,
    default: VisitStatus.INSIDE,
  })
  status: VisitStatus;

  @CreateDateColumn()
  timeIn: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  timeOut: Date | null;
}
