import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { IncidentStatus } from '../entities/incident.entity';

export class CreateIncidentRequest {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(IncidentStatus)
  status: IncidentStatus;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  affectedComponents: Types.ObjectId[];
}
