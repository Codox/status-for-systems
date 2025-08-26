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
  async getIncidents(
    @Query('before') before?: string,
    @Query('after') after?: string,
  ): Promise<Incident[]> {
    const beforeDate = before ? new Date(before) : undefined;
    const afterDate = after ? new Date(after) : undefined;

    const isValidDate = (d?: Date) => d instanceof Date && !isNaN(d.getTime());

    if (isValidDate(beforeDate) || isValidDate(afterDate)) {
      const options: any = {};
      if (isValidDate(beforeDate)) options.before = beforeDate;
      if (isValidDate(afterDate)) options.after = afterDate;
      return this.incidentsService.all(options);
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
