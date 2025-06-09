import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ComponentStatus } from '../entities/component.entity';

export class CreateComponentRequest {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsEnum(ComponentStatus)
  status: ComponentStatus;
} 