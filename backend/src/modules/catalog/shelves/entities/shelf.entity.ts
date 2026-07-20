import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShelfSection } from 'src/modules/catalog/shelf-sections/entities/shelf-section.entity';

@Entity({ name: 'shelves' })
export class Shelf {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'A-01',
  })
  @Column({
    unique: true,
    nullable: false,
  })
  code: string;

  @ApiPropertyOptional({
    example: 'Computer Science Section',
  })
  @Column({
    nullable: false,
  })
  name: string;

  @ApiPropertyOptional({
    example: 'Second floor near entrance',
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @ApiPropertyOptional({
    example: 'Floor 2',
  })
  @Column({
    nullable: true,
  })
  floor?: string;

  @OneToMany(() => ShelfSection, (section) => section.shelf)
  sections: ShelfSection[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiPropertyOptional()
  @DeleteDateColumn()
  deletedAt?: Date;
}
