import dbConnect from '@/lib/mongodb';
import IncidentModel, { Incident, IncidentStatus, IncidentImpact } from '@/lib/entities/incident.entity';
import ComponentModel, { Component } from '@/lib/entities/component.entity';
import IncidentUpdateModel, { IncidentUpdate, IncidentUpdateType, ComponentStatus } from '@/lib/entities/incident-update.entity';
import { Types } from 'mongoose';

export class IncidentsService {
  async getIncidents(options?: {
    before?: Date;
    after?: Date;
    onlyActive?: boolean;
  }): Promise<Incident[]> {
    await dbConnect();
    
    // Ensure Component schema is registered
    void ComponentModel;

    const before = options?.before;
    const after = options?.after;
    const onlyActive = options?.onlyActive === true;

    let query: any = {};

    const isValidDate = (d?: Date) => d instanceof Date && !isNaN(d.getTime());

    if (isValidDate(before) || isValidDate(after)) {
      const updatedAt: any = {};
      if (isValidDate(after)) {
        updatedAt.$gte = after;
      }
      if (isValidDate(before)) {
        updatedAt.$lte = before;
      }
      query = { updatedAt };
    } else if (onlyActive) {
      query = { status: { $ne: IncidentStatus.RESOLVED } };
    }

    return await IncidentModel.find(query)
      .populate('affectedComponents')
      .exec();
  }

  async getIncident(id: string): Promise<Incident | null> {
    await dbConnect();
    
    // Ensure Component schema is registered
    void ComponentModel;

    console.log(id);

    return await IncidentModel
        .where('_id', id)
        .findOne()
      .populate('affectedComponents')
      .exec();
  }

  async createIncident(data: {
    title: string;
    description: string;
    status?: IncidentStatus;
    impact?: IncidentImpact;
    affectedComponents?: Array<{ id: string; status: ComponentStatus }>;
  }): Promise<Incident> {
    await dbConnect();
    
    // Ensure Component schema is registered
    void ComponentModel;
    void IncidentUpdateModel;

    // Verify that all affected component IDs exist
    const componentIds = data.affectedComponents?.map((c) => c.id) || [];

    // Raw components from the database
    const existingComponents = await ComponentModel.find({
      _id: { $in: componentIds },
    }).exec();

    const incident = new IncidentModel({
      title: data.title,
      description: data.description,
      status: data.status || IncidentStatus.INVESTIGATING,
      impact: data.impact || IncidentImpact.MINOR,
      affectedComponents: existingComponents,
    });

    const savedIncident = await incident.save();

    // Update the components' statuses from the request
    if (data.affectedComponents) {
      for (const component of data.affectedComponents) {
        // Current component
        const existingComponent = existingComponents.find(
          (c) => c._id.toString() === component.id.toString(),
        );

        if (existingComponent) {
          await ComponentModel.updateOne(
            { _id: existingComponent._id },
            { $set: { status: component.status } }
          );
        }
      }
    }

    // Create the initial incident update
    const initialUpdate = new IncidentUpdateModel({
      incidentId: savedIncident._id,
      description: null,
      type: IncidentUpdateType.CREATED,
      statusUpdate: {
        from: null,
        to: savedIncident.status,
      },
      componentStatusUpdates: existingComponents.map((component) => {
        const requestComponent = data.affectedComponents?.find(
          (c) => c.id.toString() === component._id.toString(),
        );
        return {
          id: component.id,
          // Get status before the update
          from: component.status,
          // Set to the status from the request
          to: requestComponent?.status || component.status,
        };
      }),
      createdAt: new Date(),
    });

    // Save the incident update
    await initialUpdate.save();

    return await IncidentModel.findById(savedIncident._id)
      .populate('affectedComponents')
      .exec() as Incident;
  }

  async getIncidentUpdates(incidentId: string): Promise<IncidentUpdate[]> {
    await dbConnect();
    
    return await IncidentUpdateModel
      .find({ incidentId: new Types.ObjectId(incidentId) })
      .sort({ createdAt: 'desc' })
      .exec();
  }

  async createIncidentUpdate(data: {
    incidentId: string;
    description?: string;
    type?: IncidentUpdateType;
    status?: IncidentStatus;
    impact?: IncidentImpact;
    componentUpdates?: Array<{ id: string; status: ComponentStatus }>;
  }): Promise<IncidentUpdate> {
    await dbConnect();
    
    // Ensure Component schema is registered
    void ComponentModel;

    // Find the incident
    const incident = await IncidentModel
      .findById(data.incidentId)
      .populate('affectedComponents')
      .exec();

    if (!incident) {
      throw new Error(`Incident with ID ${data.incidentId} not found`);
    }

    // Get the current status before updating
    const previousStatus = incident.status;
    let newStatus = previousStatus;

    // Get the current impact before updating
    const previousImpact = incident.impact;
    let newImpact = previousImpact;

    // Update the incident status if provided
    if (data.status) {
      incident.status = data.status;
      newStatus = data.status;
    }

    // Update the incident impact if provided
    if (data.impact) {
      incident.impact = data.impact;
      newImpact = data.impact;
    }

    // Save the incident if status or impact was updated
    if (data.status || data.impact) {
      await incident.save();
    }

    // Determine the update type - if status is being set to resolved, mark as resolved
    let updateType = data.type;
    if (!updateType) {
      updateType =
        newStatus === IncidentStatus.RESOLVED
          ? IncidentUpdateType.RESOLVED
          : IncidentUpdateType.UPDATED;
    }

    // Create an incident update
    const incidentUpdateData: any = {
      incidentId: incident._id,
      description: data.description,
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

    const incidentUpdate = new IncidentUpdateModel(incidentUpdateData);

    // Track component status updates
    const componentStatusUpdates = [];

    // Process component updates if provided
    if (data.componentUpdates && data.componentUpdates.length > 0) {
      // Get all component IDs from the request
      const componentIds = data.componentUpdates.map((c) => c.id);

      // Get all components from the database that are in the request
      const components = await ComponentModel
        .find({
          _id: { $in: componentIds },
        })
        .exec();

      // Update each component's status
      for (const componentUpdate of data.componentUpdates) {
        // Find the component in the database
        const component = components.find(
          (c) => c._id.toString() === componentUpdate.id,
        );

        if (component) {
          // Get the current status before updating
          const previousComponentStatus = component.status;

          // Update the component status
          await ComponentModel.updateOne(
            { _id: component._id },
            { $set: { status: componentUpdate.status } }
          );

          // Only add to component status updates if the status has actually changed
          if (previousComponentStatus !== componentUpdate.status) {
            componentStatusUpdates.push({
              id: component._id.toString(),
              from: previousComponentStatus,
              to: componentUpdate.status,
            });
          }
        }
      }
    }

    // If incident is being resolved, automatically set all affected components to OPERATIONAL
    if (newStatus === IncidentStatus.RESOLVED && incident.affectedComponents) {
      for (const affectedComponent of incident.affectedComponents) {
        // Get the current status before updating
        const previousComponentStatus = affectedComponent.status;

        // Only update if the component is not already OPERATIONAL
        if (previousComponentStatus !== ComponentStatus.OPERATIONAL) {
          // Update the component status to OPERATIONAL
          await ComponentModel.updateOne(
            { _id: affectedComponent._id },
            { $set: { status: ComponentStatus.OPERATIONAL } }
          );

          // Add to component status updates
          componentStatusUpdates.push({
            id: affectedComponent._id.toString(),
            from: previousComponentStatus,
            to: ComponentStatus.OPERATIONAL,
          });
        }
      }
    }

    // Add the component status updates to the incident update
    incidentUpdate.componentStatusUpdates = componentStatusUpdates;

    // Save the incident update
    return await incidentUpdate.save();
  }

  async updateIncident(
    id: string,
    data: {
      title?: string;
      description?: string;
      status?: IncidentStatus;
      impact?: IncidentImpact;
      affectedComponents?: Array<{ id: string; status: ComponentStatus }>;
    }
  ): Promise<Incident> {
    await dbConnect();
    
    // Ensure Component schema is registered
    void ComponentModel;

    // Find the existing incident
    const existingIncident = await IncidentModel
      .findById(id)
      .populate('affectedComponents')
      .exec();

    if (!existingIncident) {
      throw new Error(`Incident with ID ${id} not found`);
    }

    let requestedComponents = [];

    // Only process affected components if they are provided in the request
    if (data.affectedComponents && data.affectedComponents.length > 0) {
      // Verify that all affected component IDs in the request exist
      const requestedComponentIds = data.affectedComponents.map((c) => c.id);

      // Get all components from the database that are in the request
      requestedComponents = await ComponentModel
        .find({
          _id: { $in: requestedComponentIds },
        })
        .exec();
    }

    // Update the incident fields (only if provided in the request)
    if (data.title !== undefined) {
      existingIncident.title = data.title;
    }

    if (data.description !== undefined) {
      existingIncident.description = data.description;
    }

    if (data.status !== undefined) {
      existingIncident.status = data.status;
    }

    if (data.impact !== undefined) {
      existingIncident.impact = data.impact;
    }

    if (data.affectedComponents && data.affectedComponents.length > 0) {
      existingIncident.affectedComponents = requestedComponents;
    }

    // Save the updated incident
    const updatedIncident = await existingIncident.save();

    // Update the components' statuses from the request if affected components are provided
    if (data.affectedComponents && data.affectedComponents.length > 0) {
      for (const component of data.affectedComponents) {
        // Find the component in the database
        const existingComponent = requestedComponents.find(
          (c: any) => c._id.toString() === component.id,
        );

        if (existingComponent) {
          await ComponentModel.updateOne(
            { _id: existingComponent._id },
            { $set: { status: component.status } }
          );
        }
      }
    }

    return updatedIncident;
  }
}

export default new IncidentsService();
