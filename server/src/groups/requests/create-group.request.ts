import { IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateGroupRequest {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsArray()
  @IsMongoId({ each: true })
  components: Types.ObjectId[];
} 