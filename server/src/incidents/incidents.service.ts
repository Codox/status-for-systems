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
    forEach(createIncidentRequest.affectedComponents, (component) => {
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
        console.log(
          this.componentModel.updateOne(
            { _id: existingComponent._id },
            { status: requestComponent.status },
          ),
        );
      }
    });

    // Create the initial incident update
    const initialUpdate = {
      message: 'Incident created',
      statusUpdate: {
        from: null,
        to: savedIncident.status,
      },
      componentStatusUpdates: createIncidentRequest.affectedComponents.map(
        (c) => ({
          componentId: c.id,

          // Get status before the update
          from:
            existingComponents.find(
              (ec) => ec._id.toString() === c.id.toString(),
            )?.status || 'operational',

          to: c.status,
        }),
      ),
      createdAt: new Date(),
    };

    return savedIncident;
  }
}
