import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin@localhost:27017/status_for_systems?authSource=admin';

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB.');

    const db = client.db();
    
    // Clear existing data
    await db.collection('groups').deleteMany({});
    console.log('Cleared existing groups.');

    await db.collection('components').deleteMany({});
    console.log('Cleared existing components.');

    await db.collection('incidents').deleteMany({});
    console.log('Cleared existing incidents.');

    // Insert components first
    const components = [
      {
        name: 'API Gateway',
        description: 'Main API gateway handling all incoming requests',
        status: 'operational',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Authentication Service',
        description: 'Handles user authentication and authorization',
        status: 'operational',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Database Cluster',
        description: 'Primary database cluster',
        status: 'operational',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Redis Cache',
        description: 'Caching layer for improved performance',
        status: 'operational',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const insertResult = await db.collection('components').insertMany(components);
    const createdComponents = Object.values(insertResult.insertedIds);
    console.log('Created test components');

    // Create test groups with component references
    const groups = [
      {
        name: 'Core Infrastructure',
        description: 'Essential infrastructure components',
        components: [createdComponents[0], createdComponents[2]],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Security Services',
        description: 'Security and authentication related services',
        components: [createdComponents[1]],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Performance Layer',
        description: 'Services focused on performance optimization',
        components: [createdComponents[3]],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await db.collection('groups').insertMany(groups);
    console.log('Seeded groups with component references.');

    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('Database connection closed.');
  }
}

seed();
