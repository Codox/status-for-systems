import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGroupRequest {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;
}
