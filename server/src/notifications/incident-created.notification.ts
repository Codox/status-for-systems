import { Notification, NotificationChannel } from './notifications';
import { MailMessage } from './channels/mail.channel';

export interface IncidentCreatedPayload {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  impact: string;
  url?: string;
}

export class IncidentCreatedNotification extends Notification<IncidentCreatedPayload> {
  via(_: any, __: IncidentCreatedPayload): NotificationChannel[] {
    return ['mail'];
  }

  toMail(_: any, payload: IncidentCreatedPayload): MailMessage {
    const lines: string[] = [];
    lines.push(`A new incident has been created: ${payload.title}`);
    if (payload.description) {
      lines.push('');
      lines.push(payload.description);
    }
    lines.push('');
    lines.push(`Status: ${payload.status}`);
    lines.push(`Impact: ${payload.impact}`);

    const message: MailMessage = {
      subject: `[Incident] ${payload.title}`,
      greeting: 'Hello,',
      lines,
    };

    if (payload.url) {
      message.action = { text: 'View Incident', url: payload.url };
    }

    return message;
  }
}
