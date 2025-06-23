import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IncidentsService } from './incidents.service';
import { Incident, IncidentSchema } from './entities/incident.entity';
import { Component, ComponentSchema } from '../components/entities/component.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Incident.name, schema: IncidentSchema },
      { name: Component.name, schema: ComponentSchema }
    ]),
  ],
  providers: [IncidentsService],
  exports: [IncidentsService],
})
export class IncidentsModule {}
