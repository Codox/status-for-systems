import { IsNotEmpty, IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { IncidentStatus, IncidentImpact } from '@/lib/entities/incident.entity';
import { IncidentUpdateType, ComponentStatus } from '@/lib/entities/incident-update.entity';

export class ComponentStatusUpdateRequest {
  @IsNotEmpty()
  @IsMongoId()
  id!: string;

  @IsNotEmpty()
  @IsEnum(ComponentStatus)
  status!: ComponentStatus;
}

export class CreateIncidentUpdateRequest {
  @IsNotEmpty()
  @IsMongoId()
  incidentId!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(IncidentUpdateType)
  type?: IncidentUpdateType;

  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;

  @IsOptional()
  @IsEnum(IncidentImpact)
  impact?: IncidentImpact;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComponentStatusUpdateRequest)
  componentUpdates?: ComponentStatusUpdateRequest[];
}
