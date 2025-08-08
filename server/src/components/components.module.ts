import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ComponentsService } from './components.service';
import { Component, ComponentSchema } from './entities/component.entity';
import { Group, GroupSchema } from '../groups/entities/group.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Component.name, schema: ComponentSchema },
      { name: Group.name, schema: GroupSchema },
    ]),
  ],
  providers: [ComponentsService],
  exports: [ComponentsService],
})
export class ComponentsModule {}
