import dbConnect from '@/lib/mongodb';
import IncidentModel, { Incident, IncidentStatus, IncidentImpact } from '@/lib/entities/incident.entity';
import ComponentModel, { Component } from '@/lib/entities/component.entity';
import IncidentUpdateModel, { IncidentUpdateType, ComponentStatus } from '@/lib/entities/incident-update.entity';

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

    return await IncidentModel.findById(id)
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
}

export default new IncidentsService();
