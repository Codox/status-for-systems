import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  @OnEvent('incident.created')
  handleIncidentCreated() {
  }

  @OnEvent('incident.updated')
  handleIncidentUpdated() {

  }
}
