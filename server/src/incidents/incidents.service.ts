import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Incident } from './entities/incident.entity';
import { IncidentUpdate } from './entities/incident-update.entity';
import { Component } from '../components/entities/component.entity';
import { CreateIncidentRequest } from './requests/create-incident.request';
import { UpdateIncidentRequest } from './requests/update-incident.request';
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
      .find({ incident_id: incidentId })
      .sort({ createdAt: 1 })
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

    // Get the current status before updating
    const previousStatus = existingIncident.status;

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

    // Create an incident update to track the changes
    const incidentUpdate = new this.incidentUpdateModel({
      incident_id: updatedIncident._id,
      message: 'Incident Updated',
      statusUpdate: {
        from: previousStatus,
        to: updatedIncident.status,
      },
      componentStatusUpdates: [],
      createdAt: new Date(),
    });

    // Track component status updates
    const componentStatusUpdates = [];

    // Only track component status updates if affected components are provided in the request
    if (
      updateIncidentRequest.affectedComponents &&
      updateIncidentRequest.affectedComponents.length > 0
    ) {
      // For existing components that were in the incident before the update
      for (const component of requestedComponents) {
        // Check if this component was already in the incident
        const wasInIncident = previousComponentIds.includes(
          component._id.toString(),
        );

        // Find the requested status for this component
        const requestedStatus = find(
          updateIncidentRequest.affectedComponents,
          (c) => c.id === component._id.toString(),
        )?.status;

        if (wasInIncident) {
          // Component was already in the incident, check if status changed
          const previousComponent = await this.componentModel
            .findById(component._id)
            .exec();
          if (
            previousComponent &&
            previousComponent.status !== requestedStatus
          ) {
            componentStatusUpdates.push({
              id: component._id.toString(),
              from: previousComponent.status,
              to: requestedStatus,
            });
          }
        } else {
          // Component is newly added to the incident
          componentStatusUpdates.push({
            id: component._id.toString(),
            from: component.status,
            to: requestedStatus,
          });
        }
      }
    }

    // Add the component status updates to the incident update
    incidentUpdate.componentStatusUpdates = componentStatusUpdates;

    // Save the incident update
    await incidentUpdate.save();

    return updatedIncident;
  }
}
