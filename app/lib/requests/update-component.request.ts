import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateComponentRequest {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groups?: string[];
}
