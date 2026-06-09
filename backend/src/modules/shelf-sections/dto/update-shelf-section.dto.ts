import { PartialType } from '@nestjs/swagger';
import { CreateShelfSectionDto } from './create-shelf-section.dto';

export class UpdateShelfSectionDto extends PartialType(CreateShelfSectionDto) {}
