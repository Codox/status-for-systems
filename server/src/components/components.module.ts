import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ComponentsService } from './components.service';
import { Component, ComponentSchema } from './entities/component.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Component.name, schema: ComponentSchema }]),
  ],
  providers: [ComponentsService],
  exports: [ComponentsService],
})
export class ComponentsModule {} 