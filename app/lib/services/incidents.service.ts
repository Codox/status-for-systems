import dbConnect from '@/lib/mongodb';
import IncidentModel, { Incident, IncidentStatus, IncidentImpact } from '@/lib/entities/incident.entity';
import ComponentModel from '@/lib/entities/component.entity';

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

  async createIncident(data: {
    title: string;
    description: string;
    status?: IncidentStatus;
    impact?: IncidentImpact;
    affectedComponents?: string[];
  }): Promise<Incident> {
    await dbConnect();
    
    // Ensure Component schema is registered
    void ComponentModel;

    const incident = new IncidentModel({
      title: data.title,
      description: data.description,
      status: data.status || IncidentStatus.INVESTIGATING,
      impact: data.impact || IncidentImpact.MINOR,
      affectedComponents: data.affectedComponents || [],
    });

    await incident.save();
    
    return await IncidentModel.findById(incident._id)
      .populate('affectedComponents')
      .exec() as Incident;
  }
}

export default new IncidentsService();
