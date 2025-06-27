import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Incident } from './entities/incident.entity';
import { Component } from '../components/entities/component.entity';
import { CreateIncidentRequest } from './requests/create-incident.request';
import { map, forEach, find } from 'remeda';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectModel(Incident.name) private readonly incidentModel: Model<Incident>,
    @InjectModel(Component.name)
    private readonly componentModel: Model<Component>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async findAll(): Promise<Incident[]> {
    return this.incidentModel.find().populate('affectedComponents').exec();
  }

  async findOne(id: string): Promise<Incident> {
    return this.incidentModel
      .findById(id)
      .populate('affectedComponents')
      .exec();
  }

  async create(
    createIncidentRequest: CreateIncidentRequest,
  ): Promise<Incident> {
    // Verify that all affected component IDs exist
    let componentIds = map(
      createIncidentRequest.affectedComponents,
      (c) => c.id,
    ) as string[];

    // Raw components from the database
    const existingComponents = await this.componentModel
      .find({
        _id: { $in: componentIds },
      })
      .exec();

    componentIds = existingComponents.map((c) => c._id) as string[];

    const incident = new this.incidentModel({
      title: createIncidentRequest.title,
      description: createIncidentRequest.description,
      status: createIncidentRequest.status || 'investigating',
      impact: createIncidentRequest.impact || 'minor',
      affectedComponents: componentIds,
    });

    const savedIncident = await incident.save();

    // Update the components' statuses from the request
    forEach(createIncidentRequest.affectedComponents, async (component) => {
      // Current component
      const existingComponent = find(
        existingComponents,
        (c) => c._id.toString() === component.id.toString(),
      );

      // Get requested status to set the component to
      const requestComponent = find(
        createIncidentRequest.affectedComponents,
        (c) => c.id.toString() === existingComponent._id.toString(),
      );

      console.log(existingComponent);
      console.log(existingComponent._id);
      console.log(requestComponent);

      if (existingComponent) {
        await this.componentModel.updateOne({ _id: existingComponent._id }, [
          { $set: { status: requestComponent.status } },
        ]);
      }
    });

    // Create the initial incident update
    const initialUpdate = {
      message: 'Incident Created',
      statusUpdate: {
        from: null,
        to: savedIncident.status,
      },
      componentStatusUpdates: map(existingComponents, (component) => ({
        id: component.id,

        // Get status before the update
        from: component.status,

        // Set to the status from the request
        to: find(
          createIncidentRequest.affectedComponents,
          (c) => c.id.toString() === component._id.toString(),
        ).status,
      })),
      createdAt: new Date(),
    };

    // Add the initial update to the incident
    savedIncident.updates = [initialUpdate];
    await savedIncident.save();

    return savedIncident;
  }
}
