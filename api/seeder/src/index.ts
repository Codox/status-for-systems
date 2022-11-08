import {DataSource} from "typeorm";
import {SystemStatus} from "./entities/SystemStatus";

export const dataSource = new DataSource({
  type: "mysql",
  host: "127.0.0.1",
  port: 3308,
  username: "root",
  password: "therootpassword",
  database: "status_for_systems",
  synchronize: false,
  entities: [
    SystemStatus
  ],
});


const systemStatusNames = [
  'Investigating',
  'Identified',
  'Monitoring',
  'Resolved',
];

const systemStatuses = [

];

async function addStatuses() {
  // System statuses
  const systemStatusRepository = dataSource.getRepository(SystemStatus);
  for (const name of systemStatusNames) {
    const status = new SystemStatus({name});
    await systemStatusRepository.save(status);
  }
}

export async function run() {
  await dataSource.initialize();
  console.log('Connected to database');

  await addStatuses();

  console.log(systemStatuses);
}

run();

