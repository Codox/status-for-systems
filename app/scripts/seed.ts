import "dotenv/config";

import dbConnect from '@/lib/mongodb';
import Group from '@/lib/entities/group.entity';

async function runSeeder() {
    await dbConnect();

    console.log("Connected to MongoDB.");

    await Group.deleteMany({});
    console.log("Cleared existing groups.");

    await Group.insertMany([
        {
            name: "Admin Group",
            description: "System admin group",
            components: [],
        },
        {
            name: "User Group",
            description: "Basic user access group",
            components: [],
        },
    ]);

    console.log("Seeded groups.");
}

runSeeder()
    .then(() => {
        console.log("Seeder finished.");
        process.exit(0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
