import {DataSource} from "typeorm";
import {SystemStatus} from "./entities/system-status.entity";
import _ from "lodash";
import {IncidentStatus} from "./entities/incident-status.entity";
import {SystemGroup} from "./entities/system-group.entity";
import { faker } from '@faker-js/faker';

export const dataSource = new DataSource({
  type: "mysql",
  host: "127.0.0.1",
  port: 3308,
  username: "root",
  password: "therootpassword",
  database: "status_for_systems",
  synchronize: false,
  entities: [
    SystemStatus,
    IncidentStatus,
    SystemGroup,
  ],
});

const systemStatusNames = [
  'Operational',
  'Degraded performance',
  'Partial outage',
  'Major outage',
];

const incidentStatusNames = [
  'Investigating',
  'Identified',
  'Monitoring',
  'Resolved',
];

async function addStatuses() {
  // System statuses
  const systemStatusRepository = dataSource.getRepository(SystemStatus);
  const systemStatuses = await systemStatusRepository.find();

  for (const name of systemStatusNames.filter((name) => !_.map(systemStatuses, 'name').includes(name))) {
    const status = new SystemStatus({name});
    await systemStatusRepository.save(status);
  }

  // Incident statuses
  const incidentStatusRepository = dataSource.getRepository(IncidentStatus);
  const incidentStatuses = await incidentStatusRepository.find();

  for (const name of incidentStatusNames.filter((name) => !_.map(incidentStatuses, 'name').includes(name))) {
    const status = new IncidentStatus({name});
    await incidentStatusRepository.save(status);
  }

  // Create system group
  const systemGroupRepository = dataSource.getRepository(SystemGroup);
  let systemGroupApi = new SystemGroup({name: faker.company.name()});
  systemGroupApi = await systemGroupRepository.save(systemGroupApi, {reload: true});

  console.log(systemGroupApi);
}

export async function run() {
  await dataSource.initialize();
  console.log('Connected to database');

  console.log('Adding statuses');
  await addStatuses();



  console.log('Done');
}

run();

