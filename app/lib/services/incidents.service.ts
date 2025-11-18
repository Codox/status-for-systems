import dbConnect from '@/lib/mongodb';
import IncidentModel, { Incident, IncidentStatus } from '@/lib/entities/incident.entity';
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
}

export default new IncidentsService();
