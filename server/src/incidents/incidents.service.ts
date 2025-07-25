import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { Incident, IncidentStatus, IncidentImpact } from './entities/incident.entity';
import {
  IncidentUpdate,
  IncidentUpdateType,
} from './entities/incident-update.entity';
import { Component } from '../components/entities/component.entity';
import { CreateIncidentRequest } from './requests/create-incident.request';
import { UpdateIncidentRequest } from './requests/update-incident.request';
import { CreateIncidentUpdateRequest } from './requests/create-incident-update.request';
import { map, forEach, find, difference } from 'remeda';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectModel(Incident.name) private readonly incidentModel: Model<Incident>,
    @InjectModel(IncidentUpdate.name)
    private readonly incidentUpdateModel: Model<IncidentUpdate>,
    @InjectModel(Component.name)
    private readonly componentModel: Model<Component>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async all(): Promise<Incident[]> {
    return this.incidentModel.find().populate('affectedComponents').exec();
  }

  async one(id: string): Promise<Incident> {
    return this.incidentModel
      .findById(id)
      .populate('affectedComponents')
      .exec();
  }

  async getIncidentUpdates(incidentId: string): Promise<IncidentUpdate[]> {
    return this.incidentUpdateModel
      .find({ incidentId: new Types.ObjectId(incidentId) })
      .sort({ createdAt: 'desc' })
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
      affectedComponents: existingComponents,
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

      if (existingComponent) {
        await this.componentModel.updateOne({ _id: existingComponent._id }, [
          { $set: { status: requestComponent.status } },
        ]);
      }
    });

    // Create the initial incident update
    const initialUpdate = new this.incidentUpdateModel({
      incidentId: savedIncident._id as any,
      description: null,
      type: IncidentUpdateType.CREATED,
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
    });

    // Save the incident update
    await initialUpdate.save();

    return savedIncident;
  }

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

    // Get the current affected components before updating
    const previousComponentIds = existingIncident.affectedComponents.map((c) =>
      c._id.toString(),
    );

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

    return updatedIncident;
  }

  async createIncidentUpdate(
    createIncidentUpdateRequest: CreateIncidentUpdateRequest,
  ): Promise<IncidentUpdate> {
    // Find the incident
    const incident = await this.incidentModel
      .findById(createIncidentUpdateRequest.incidentId)
      .populate('affectedComponents')
      .exec();

    if (!incident) {
      throw new NotFoundException(
        `Incident with ID ${createIncidentUpdateRequest.incidentId} not found`,
      );
    }

    // Get the current status before updating
    const previousStatus = incident.status;
    let newStatus = previousStatus;

    // Get the current impact before updating
    const previousImpact = incident.impact;
    let newImpact = previousImpact;

    // Update the incident status if provided
    if (createIncidentUpdateRequest.status) {
      incident.status = createIncidentUpdateRequest.status;
      newStatus = createIncidentUpdateRequest.status;
    }

    // Update the incident impact if provided
    if (createIncidentUpdateRequest.impact) {
      incident.impact = createIncidentUpdateRequest.impact;
      newImpact = createIncidentUpdateRequest.impact;
    }

    // Save the incident if status or impact was updated
    if (createIncidentUpdateRequest.status || createIncidentUpdateRequest.impact) {
      await incident.save();
    }

    // Determine the update type - if status is being set to resolved, mark as resolved
    let updateType = createIncidentUpdateRequest.type;
    if (!updateType) {
      updateType = newStatus === IncidentStatus.RESOLVED
        ? IncidentUpdateType.RESOLVED
        : IncidentUpdateType.UPDATED;
    }

    // Create an incident update
    const incidentUpdateData: any = {
      incidentId: incident._id,
      description: createIncidentUpdateRequest.description,
      type: updateType,
      componentStatusUpdates: [],
      createdAt: new Date(),
    };

    // Only add statusUpdate if the status actually changed
    if (previousStatus !== newStatus) {
      incidentUpdateData.statusUpdate = {
        from: previousStatus,
        to: newStatus,
      };
    }

    // Only add impactUpdate if the impact actually changed
    if (previousImpact !== newImpact) {
      incidentUpdateData.impactUpdate = {
        from: previousImpact,
        to: newImpact,
      };
    }

    const incidentUpdate = new this.incidentUpdateModel(incidentUpdateData);

    // Track component status updates
    const componentStatusUpdates = [];

    // Process component updates if provided
    if (
      createIncidentUpdateRequest.componentUpdates &&
      createIncidentUpdateRequest.componentUpdates.length > 0
    ) {
      // Get all component IDs from the request
      const componentIds = map(
        createIncidentUpdateRequest.componentUpdates,
        (c) => c.id,
      ) as string[];

      // Get all components from the database that are in the request
      const components = await this.componentModel
        .find({
          _id: { $in: componentIds },
        })
        .exec();

      // Update each component's status
      for (const componentUpdate of createIncidentUpdateRequest.componentUpdates) {
        // Find the component in the database
        const component = find(
          components,
          (c) => c._id.toString() === componentUpdate.id,
        );

        if (component) {
          // Get the current status before updating
          const previousComponentStatus = component.status;

          // Update the component status
          await this.componentModel.updateOne({ _id: component._id }, [
            { $set: { status: componentUpdate.status } },
          ]);

          // Add to component status updates
          componentStatusUpdates.push({
            id: component._id.toString(),
            from: previousComponentStatus,
            to: componentUpdate.status,
          });
        }
      }
    }

    // Add the component status updates to the incident update
    incidentUpdate.componentStatusUpdates = componentStatusUpdates;

    // Save the incident update
    return incidentUpdate.save();
  }
}
