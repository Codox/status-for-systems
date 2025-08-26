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

  /**
   * DONE
   */
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

  @Post('incidents/updates')
  async createIncidentUpdate(
    @Body() createIncidentUpdateRequest: CreateIncidentUpdateRequest,
  ): Promise<IncidentUpdate> {
    return this.incidentsService.createIncidentUpdate(
      createIncidentUpdateRequest,
    );
  }

  @Get('components')
  async findAllComponents(): Promise<Component[]> {
    return this.componentsService.findAll();
  }

  @Get('components/ungrouped')
  async findUngroupedComponents(): Promise<Component[]> {
    return this.componentsService.findUngrouped();
  }
  @Post('components')
  async createComponent(
    @Body() createComponentRequest: CreateComponentRequest,
  ): Promise<Component> {
    return this.componentsService.create(createComponentRequest);
  }

  @Patch('components/:id')
  async updateComponent(
    @Param('id') id: string,
    @Body() updateComponentRequest: UpdateComponentRequest,
  ): Promise<Component> {
    return this.componentsService.update(id, updateComponentRequest);
  }
  @Get('groups')
  async findAllGroups(): Promise<Group[]> {
    return this.groupsService.findAll();
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

  @Post('incidents')
  async createIncident(
    @Body() createIncidentRequest: CreateIncidentRequest,
  ): Promise<Incident> {
    return this.incidentsService.create(createIncidentRequest);
  }

  @Put('incidents/:id')
  async updateIncident(
    @Param('id') id: string,
    @Body() updateIncidentRequest: UpdateIncidentRequest,
  ): Promise<Incident> {
    return this.incidentsService.update(id, updateIncidentRequest);
  }
}
