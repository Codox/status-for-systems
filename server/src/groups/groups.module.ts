import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupsService } from './groups.service';
import { Group, GroupSchema } from './entities/group.entity';
import {
  Component,
  ComponentSchema,
} from '../components/entities/component.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: Component.name, schema: ComponentSchema },
    ]),
  ],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
