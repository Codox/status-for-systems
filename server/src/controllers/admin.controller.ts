import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Component } from '../components/entities/component.entity';
import { Group } from '../groups/entities/group.entity';
import { Incident } from '../incidents/entities/incident.entity';
import { CreateComponentRequest } from '../components/requests/create-component.request';
import { CreateGroupRequest } from '../groups/requests/create-group.request';
import { CreateIncidentRequest } from '../incidents/requests/create-incident.request';
import { BasicAuthGuard } from '../auth/basic-auth.guard';
import { GroupsService } from '../groups/groups.service';
import { ComponentsService } from '../components/components.service';
import { IncidentsService } from '../incidents/incidents.service';

@Controller('admin')
@UseGuards(BasicAuthGuard)
export class AdminController {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly componentsService: ComponentsService,
    private readonly incidentsService: IncidentsService,
  ) {}

  @Get('components')
  async findAllComponents(): Promise<Component[]> {
    return this.componentsService.findAll();
  }

  @Get('components/:id')
  async findOneComponent(@Param('id') id: string): Promise<Component> {
    // TODO: Implement findOne
    return null;
  }

  @Post('components')
  async createComponent(
    @Body() createComponentRequest: CreateComponentRequest,
  ): Promise<Component> {
    // TODO: Implement create
    return null;
  }

  @Put('components/:id')
  async updateComponent(
    @Param('id') id: string,
    @Body() updateComponentRequest: CreateComponentRequest,
  ): Promise<Component> {
    // TODO: Implement update
    return null;
  }

  @Delete('components/:id')
  async removeComponent(@Param('id') id: string): Promise<void> {
    // TODO: Implement remove
  }

  @Get('groups')
  async findAllGroups(): Promise<Group[]> {
    return this.groupsService.findAll();
  }

  @Get('groups/:id')
  async findOneGroup(@Param('id') id: string): Promise<Group> {
    // TODO: Implement findOne
    return null;
  }

  @Post('groups')
  async createGroup(
    @Body() createGroupRequest: CreateGroupRequest,
  ): Promise<Group> {
    return this.groupsService.create(createGroupRequest);
  }

  @Put('groups/:id')
  async updateGroup(
    @Param('id') id: string,
    @Body() updateGroupRequest: CreateGroupRequest,
  ): Promise<Group> {
    // TODO: Implement update
    return null;
  }

  @Delete('groups/:id')
  async removeGroup(@Param('id') id: string): Promise<void> {
    // TODO: Implement remove
  }

  @Get('incidents')
  async findAllIncidents(): Promise<Incident[]> {
    return this.incidentsService.findAll();
  }

  @Get('incidents/:id')
  async findOneIncident(@Param('id') id: string): Promise<Incident> {
    return this.incidentsService.findOne(id);
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
    @Body() updateIncidentRequest: CreateIncidentRequest,
  ): Promise<Incident> {
    // TODO: Implement update
    return null;
  }

  @Delete('incidents/:id')
  async removeIncident(@Param('id') id: string): Promise<void> {
    // TODO: Implement remove
  }
}
