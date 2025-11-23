import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Incident, IncidentStatus } from './entities/incident.entity';
import {
  IncidentUpdate,
  IncidentUpdateType,
} from './entities/incident-update.entity';
import {
  Component,
  ComponentStatus,
} from '../components/entities/component.entity';
import { CreateIncidentRequest } from './requests/create-incident.request';
import { UpdateIncidentRequest } from './requests/update-incident.request';
import { CreateIncidentUpdateRequest } from './requests/create-incident-update.request';
import { map, forEach, find } from 'remeda';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IncidentCreatedEvent } from '../events/incident-created.event';
import { IncidentUpdatedEvent } from '../events/incident-updated.event';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectModel(Incident.name) private readonly incidentModel: Model<Incident>,
    @InjectModel(IncidentUpdate.name)
    private readonly incidentUpdateModel: Model<IncidentUpdate>,
    @InjectModel(Component.name)
    private readonly componentModel: Model<Component>,
    private eventEmitter: EventEmitter2,
  ) {}

  async update(
    id: string,
    updateIncidentRequest: UpdateIncidentRequest,
  ): Promise<Incident> {
    // Find the existing incident
    const existingIncident = await this.incidentModel
      .findById(id)
      .populate('affectedComponents')
      .exec();

    if (!existingIncident) {
      throw new NotFoundException(`Incident with ID ${id} not found`);
    }

    let requestedComponents = [];

    // Only process affected components if they are provided in the request
    if (
      updateIncidentRequest.affectedComponents &&
      updateIncidentRequest.affectedComponents.length > 0
    ) {
      // Verify that all affected component IDs in the request exist
      const requestedComponentIds = map(
        updateIncidentRequest.affectedComponents,
        (c) => c.id,
      ) as string[];

      // Get all components from the database that are in the request
      requestedComponents = await this.componentModel
        .find({
          _id: { $in: requestedComponentIds },
        })
        .exec();
    }

    // Update the incident fields (only if provided in the request)
    if (updateIncidentRequest.title !== undefined) {
      existingIncident.title = updateIncidentRequest.title;
    }

    if (updateIncidentRequest.description !== undefined) {
      existingIncident.description = updateIncidentRequest.description;
    }

    if (updateIncidentRequest.status !== undefined) {
      existingIncident.status = updateIncidentRequest.status;
    }

    if (updateIncidentRequest.impact !== undefined) {
      existingIncident.impact = updateIncidentRequest.impact;
    }

    if (
      updateIncidentRequest.affectedComponents &&
      updateIncidentRequest.affectedComponents.length > 0
    ) {
      existingIncident.affectedComponents = requestedComponents;
    }

    // Save the updated incident
    const updatedIncident = await existingIncident.save();

    // Update the components' statuses from the request if affected components are provided
    if (
      updateIncidentRequest.affectedComponents &&
      updateIncidentRequest.affectedComponents.length > 0
    ) {
      forEach(updateIncidentRequest.affectedComponents, async (component) => {
        // Find the component in the database
        const existingComponent = find(
          requestedComponents,
          (c) => c._id.toString() === component.id,
        );

        if (existingComponent) {
          await this.componentModel.updateOne({ _id: existingComponent._id }, [
            { $set: { status: component.status } },
          ]);
        }
      });
    }

    this.eventEmitter.emit('incident.updated', new IncidentUpdatedEvent());

    return updatedIncident;
  }

}
