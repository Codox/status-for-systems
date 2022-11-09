import {BaseEntity, Column, Entity, Generated, PrimaryGeneratedColumn} from "typeorm";

@Entity({
  name: 'incident_statuses',
})
export class IncidentStatus extends BaseEntity {
  constructor(data: Partial<IncidentStatus>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Generated("uuid")
  uuid: string;

  @Column()
  name: string;
}
