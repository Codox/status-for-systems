import { Component, OnInit } from '@angular/core';
import {SystemService} from "../../services/system.service";
import {SystemGroup} from "../../interfaces/system-group.interface";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  systemGroups?: SystemGroup[];
  systems: any = {};

  constructor(
    private readonly systemService: SystemService
  ) { }

  async ngOnInit() {
    console.log("CALLED");
    this.systemGroups = await this.systemService.getSystemGroups();
  }

  async getSystemDetails(data: SystemGroup) {
    const systemGroup = await this.systemService.getSystemGroup(data.uuid);

    this.systems[systemGroup.uuid] = systemGroup.systems;
  }
}
