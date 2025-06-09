import { IsArray, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateGroupRequest {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsArray()
  @IsMongoId({ each: true })
  components: Types.ObjectId[];
} 