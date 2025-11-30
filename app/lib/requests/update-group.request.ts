import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateGroupRequest {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  components?: string[];
}
