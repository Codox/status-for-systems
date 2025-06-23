import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Incident } from './entities/incident.entity';
import { Component } from '../components/entities/component.entity';
import { CreateIncidentRequest } from './requests/create-incident.request';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectModel(Incident.name) private readonly incidentModel: Model<Incident>,
    @InjectModel(Component.name) private readonly componentModel: Model<Component>,
  ) {}

  async findAll(): Promise<Incident[]> {
    return this.incidentModel.find().populate('affectedComponents').exec();
  }

  async findOne(id: string): Promise<Incident> {
    return this.incidentModel.findById(id).populate('affectedComponents').exec();
  }

  async create(createIncidentRequest: CreateIncidentRequest): Promise<Incident> {
    // Verify that all component IDs exist
    const componentIds = createIncidentRequest.affectedComponents;
    if (componentIds && componentIds.length > 0) {
      const existingComponents = await this.componentModel.find({
        _id: { $in: componentIds }
      }).exec();

      if (existingComponents.length !== componentIds.length) {
        throw new NotFoundException('One or more component IDs do not exist');
      }
    }

    const incident = new this.incidentModel(createIncidentRequest);
    return incident.save();
  }
}
