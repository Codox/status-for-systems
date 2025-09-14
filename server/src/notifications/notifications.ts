export type NotificationChannel = 'mail';

// Registry of available channel transports for notifications to use
export interface NotificationChannelsRegistry {
  mail: import('./channels/mail.channel').MailChannel;
}

export abstract class Notification<TPayload = any> {
  // Which channels to send on
  abstract via(notifiable: any, payload: TPayload): NotificationChannel[];

  // Channel formatters (optional; implement ones you need)
  toMail?(
    notifiable: any,
    payload: TPayload,
  ): import('./channels/mail.channel').MailMessage | undefined;

  async send(
    notifiable: any,
    payload: TPayload,
    channels: NotificationChannelsRegistry,
  ): Promise<void> {
    const enabled = this.via(notifiable, payload) || [];

    for (const channel of enabled) {
      if (channel === 'mail' && this.toMail) {
        const message = this.toMail(notifiable, payload);
        if (message) {
          // TODO: route the notifiable to an email address when available
          await channels.mail.send('admin@example.com', message);
        }
      }
    }
  }
}
