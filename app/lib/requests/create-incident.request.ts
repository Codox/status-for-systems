import { IsNotEmpty, IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { IncidentStatus, IncidentImpact } from '@/lib/entities/incident.entity';
import { ComponentStatus } from '@/lib/entities/incident-update.entity';

export class AffectedComponentRequest {
  @IsNotEmpty()
  @IsMongoId()
  id: string;

  @IsNotEmpty()
  @IsEnum(ComponentStatus)
  status: ComponentStatus;
}

export class CreateIncidentRequest {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

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
