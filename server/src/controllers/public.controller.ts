import { Controller, Get, Param } from '@nestjs/common';
import { Component } from '../components/entities/component.entity';

@Controller('public')
export class PublicController {
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
} 