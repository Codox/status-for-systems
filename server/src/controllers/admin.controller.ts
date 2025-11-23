import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Component } from '../components/entities/component.entity';
import { Group } from '../groups/entities/group.entity';
import { Incident } from '../incidents/entities/incident.entity';
import { IncidentUpdate } from '../incidents/entities/incident-update.entity';
import { CreateComponentRequest } from '../components/requests/create-component.request';
import { UpdateComponentRequest } from '../components/requests/update-component.request';
import { CreateGroupRequest } from '../groups/requests/create-group.request';
import { UpdateGroupRequest } from '../groups/requests/update-group.request';
import { CreateIncidentRequest } from '../incidents/requests/create-incident.request';
import { UpdateIncidentRequest } from '../incidents/requests/update-incident.request';
import { CreateIncidentUpdateRequest } from '../incidents/requests/create-incident-update.request';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GroupsService } from '../groups/groups.service';
import { ComponentsService } from '../components/components.service';
import { IncidentsService } from '../incidents/incidents.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly componentsService: ComponentsService,
    private readonly incidentsService: IncidentsService,
  ) {}


  @Patch('components/:id')
  async updateComponent(
    @Param('id') id: string,
    @Body() updateComponentRequest: UpdateComponentRequest,
  ): Promise<Component> {
    return this.componentsService.update(id, updateComponentRequest);
  }


  @Post('groups')
  async createGroup(
    @Body() createGroupRequest: CreateGroupRequest,
  ): Promise<Group> {
    return this.groupsService.create(createGroupRequest);
  }

  @Patch('groups/:id')
  async updateGroup(
    @Param('id') id: string,
    @Body() updateGroupRequest: UpdateGroupRequest,
  ): Promise<Group> {
    return this.groupsService.update(id, updateGroupRequest);
  }

  @Put('incidents/:id')
  async updateIncident(
    @Param('id') id: string,
    @Body() updateIncidentRequest: UpdateIncidentRequest,
  ): Promise<Incident> {
    return this.incidentsService.update(id, updateIncidentRequest);
  }
}
