import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BASE_URL} from "../app.module";
import {catchError, map} from "rxjs/operators";
import {SystemGroup} from "../interfaces/system-group.interface";

@Injectable({
  providedIn: 'root'
})
export class SystemService {

  constructor(
    private readonly httpClient: HttpClient
  ) {
  }

  public async getSystemGroups(): Promise<SystemGroup[]> {
    return this.httpClient.get(`${BASE_URL}/system-groups`)
      .pipe(
        map((response: any) => response.data),
        catchError((error: any) => {
          throw error;
        })
      )
      .toPromise();
  }

  public async getSystemGroup(uuid: string): Promise<SystemGroup> {
    return this.httpClient.get(`${BASE_URL}/system-groups/${uuid}`)
      .pipe(
        map((response: any) => response.data),
        catchError((error: any) => {
          throw error;
        })
      )
      .toPromise();
  }
}
