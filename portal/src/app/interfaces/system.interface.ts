import {SystemStatus} from "./system-status.interface";

export interface System {
  uuid: string;
  name: string;
  status: SystemStatus;
  createdAt: Date;
  updatedAt: Date;
}
