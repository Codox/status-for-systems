import {BaseEntity, Column, Entity, Generated, PrimaryGeneratedColumn} from "typeorm";

@Entity({
  name: 'system_groups',
})
export class SystemGroup extends BaseEntity {
  constructor(data: Partial<SystemGroup>) {
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
