import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// import { CommandModule } from 'nest-commander';
import { SeedCommand } from './seed.command';
import { Group, GroupSchema } from '../groups/entities/group.entity';
import { Component, ComponentSchema } from '../components/entities/component.entity';

@Module({
  imports: [
    // CommandModule,
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: Component.name, schema: ComponentSchema },
    ]),
  ],
  providers: [SeedCommand],
  exports: [SeedCommand],
})
export class SeedersModule {} 