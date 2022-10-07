import {System} from "./system.interface";

export interface SystemGroup {
  uuid: string;
  name: string;
  systems?: System[];
  createdAt: Date;
  updatedAt: Date;
}
