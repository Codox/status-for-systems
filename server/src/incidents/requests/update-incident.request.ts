import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IncidentStatus, IncidentImpact } from '../entities/incident.entity';
import { ComponentStatus } from '../../components/entities/component.entity';

export class AffectedComponentRequest {
  @IsNotEmpty()
  @IsMongoId()
  id: string;

  @IsNotEmpty()
  @IsEnum(ComponentStatus)
  status: ComponentStatus;
}

export class UpdateIncidentRequest {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;

  @IsOptional()
  @IsEnum(IncidentImpact)
  impact?: IncidentImpact;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AffectedComponentRequest)
  affectedComponents?: AffectedComponentRequest[];
}
