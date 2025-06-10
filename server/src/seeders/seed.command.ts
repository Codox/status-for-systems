import { Command, CommandRunner } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group } from '../groups/entities/group.entity';
import { Component } from '../components/entities/component.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
@Command({ name: 'seed:test-data', description: 'Seed the database with test data for groups and components' })
export class SeedCommand extends CommandRunner {
  constructor(
    @InjectModel(Group.name) private readonly groupModel: Model<Group>,
    @InjectModel(Component.name) private readonly componentModel: Model<Component>
  ) {
    super();
  }

  async run(): Promise<void> {
    try {
      // Clear existing data
      await this.groupModel.deleteMany({});
      await this.componentModel.deleteMany({});
      console.log('Cleared existing data');


      // Create test components
      const components = [
        {
          name: 'API Gateway',
          description: 'Main API gateway handling all incoming requests',
          status: 'operational',
        },
        {
          name: 'Authentication Service',
          description: 'Handles user authentication and authorization',
          status: 'operational',
        },
        {
          name: 'Database Cluster',
          description: 'Primary database cluster',
          status: 'operational',
        },
        {
          name: 'Redis Cache',
          description: 'Caching layer for improved performance',
          status: 'operational',
        },
      ];

      const createdComponents = await this.componentModel.insertMany(components);
      console.log('Created test components');

      // Create test groups
      const groups = [
        {
          name: 'Core Infrastructure',
          description: 'Essential infrastructure components',
          components: [createdComponents[0]._id, createdComponents[2]._id],
        },
        {
          name: 'Security Services',
          description: 'Security and authentication related services',
          components: [createdComponents[1]._id],
        },
        {
          name: 'Performance Layer',
          description: 'Services focused on performance optimization',
          components: [createdComponents[3]._id],
        },
      ];

      await this.groupModel.insertMany(groups);
      console.log('Created test groups');

      console.log('Test data seeded successfully!');
    } catch (error) {
      console.error('Error seeding test data:', error);
    }
  }
} 