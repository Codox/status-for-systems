import { Controller, Get, Param } from '@nestjs/common';
import { Component } from '../components/entities/component.entity';
import { Group } from '../groups/entities/group.entity';
import { Incident } from '../incidents/entities/incident.entity';
import { GroupsService } from '../groups/groups.service';
import { IncidentsService } from '../incidents/incidents.service';

@Controller('public')
export class PublicController {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly incidentsService: IncidentsService,
  ) {}

  @Get('components')
  async findAllComponents(): Promise<Component[]> {
    // TODO: Implement findAll
    return [];
  }

  @Get('components/:id')
  async findOneComponent(@Param('id') id: string): Promise<Component> {
    // TODO: Implement findOne
    return null;
  }

  @Get('groups')
  async findAllGroups(): Promise<Group[]> {
    return this.groupsService.findAll();
  }

  @Get('groups/:id')
  async findOneGroup(@Param('id') id: string): Promise<Group> {
    return this.groupsService.findOne(id);
  }

  @Get('incidents')
  async getIncidents(): Promise<Incident[]> {
    return this.incidentsService.all();
  }

  @Get('incidents/:id')
  async getIncident(@Param('id') id: string): Promise<Incident> {
    return this.incidentsService.one(id);
  }
}
