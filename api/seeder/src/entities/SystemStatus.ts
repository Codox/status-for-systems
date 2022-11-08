import {BaseEntity, Column, Entity, Generated, PrimaryGeneratedColumn} from "typeorm";

@Entity({
  name: 'system_statuses',
})
export class SystemStatus extends BaseEntity {
  constructor(data: Partial<SystemStatus>) {
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
