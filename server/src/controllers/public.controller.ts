import { Controller, Get, Param } from '@nestjs/common';
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
  async getIncidents(): Promise<Incident[]> {
    return this.incidentsService.all();
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
