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
import { IncidentStatus } from '../entities/incident.entity';
import { ComponentStatus } from '../../components/entities/component.entity';

export class ComponentStatusUpdateRequest {
  @IsNotEmpty()
  @IsMongoId()
  id: string;

  @IsNotEmpty()
  @IsEnum(ComponentStatus)
  status: ComponentStatus;
}

export class CreateIncidentUpdateRequest {
  @IsNotEmpty()
  @IsMongoId()
  incidentId: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComponentStatusUpdateRequest)
  componentUpdates?: ComponentStatusUpdateRequest[];
}
