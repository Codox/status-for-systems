import dbConnect from '@/lib/mongodb';
import ComponentModel, { Component } from '@/lib/entities/component.entity';

export class ComponentsService {
  async getComponents(): Promise<Component[]> {
    await dbConnect();
    
    return await ComponentModel.find().exec();
  }
}

export default new ComponentsService();
