import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Component } from '../components/entities/component.entity';
import { CreateComponentRequest } from '../components/requests/create-component.request';

@Controller('admin')
export class AdminController {
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

  @Post('components')
  async createComponent(@Body() createComponentRequest: CreateComponentRequest): Promise<Component> {
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
} 