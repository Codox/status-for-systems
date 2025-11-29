import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ComponentStatus } from '../entities/incident-update.entity';

export class CreateComponentRequest {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsEnum(ComponentStatus)
  status!: ComponentStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groups?: string[];
}
