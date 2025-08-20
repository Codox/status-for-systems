import { Controller, Get, Param, Query } from '@nestjs/common';
import { Group } from '../groups/entities/group.entity';
import { Incident } from '../incidents/entities/incident.entity';
import { IncidentUpdate } from '../incidents/entities/incident-update.entity';
import { GroupsService } from '../groups/groups.service';
import { IncidentsService } from '../incidents/incidents.service';

@Controller('public')
export class PublicController {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly incidentsService: IncidentsService,
  ) {}
  @Get('groups')
  async findAllGroups(): Promise<Group[]> {
    return this.groupsService.findAll();
  }

  @Get('groups/:id')
  async findOneGroup(@Param('id') id: string): Promise<Group> {
    return this.groupsService.findOne(id);
  }

  @Get('incidents')
  async getIncidents(@Query('at') at?: string): Promise<Incident[]> {
    const date = at ? new Date(at) : undefined;
    if (date && !isNaN(date.getTime())) {
      return this.incidentsService.all({ at: date });
    }
    return this.incidentsService.all({ onlyActive: true });
  }

  @Get('incidents/:id')
  async getIncident(@Param('id') id: string): Promise<Incident> {
    return this.incidentsService.one(id);
  }

  @Get('incidents/:id/updates')
  async getIncidentUpdates(@Param('id') id: string): Promise<IncidentUpdate[]> {
    return this.incidentsService.getIncidentUpdates(id);
  }
}
