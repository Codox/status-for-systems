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

    // Insert seed data
    await db.collection('groups').insertMany([
      {
        name: 'Admin Group',
        description: 'System admin group',
        components: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'User Group',
        description: 'Basic user access group',
        components: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    console.log('Seeded groups.');

    await db.collection('components').insertMany([
      {
        name: 'API Service',
        status: 'operational',
        description: 'Main API service',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Database',
        status: 'operational',
        description: 'MongoDB database',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    console.log('Seeded components.');

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
