import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { IncidentCreatedNotification } from './incident-created.notification';
import { MailChannel } from './channels/mail.channel';
import { IncidentCreatedEvent } from '../events/incident-created.event';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly mail: MailChannel) {}

  @OnEvent('incident.created')
  async handleIncidentCreated(payload: IncidentCreatedEvent) {
    // Create the notification and let it decide which channels to use
    const notification = new IncidentCreatedNotification();

    await notification.send(
      null,
      {
        id: payload?.id ?? '',
        title: payload?.title ?? 'New Incident',
        description: payload?.description ?? null,
        status: payload?.status ?? 'investigating',
        impact: payload?.impact ?? 'minor',
      },
      { mail: this.mail },
    );

    this.logger.log(`Dispatched IncidentCreatedNotification`);
  }

  @OnEvent('incident.updated')
  handleIncidentUpdated() {
    // Placeholder for future update notifications
  }
}

