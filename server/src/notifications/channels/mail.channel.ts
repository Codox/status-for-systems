import { Injectable } from '@nestjs/common';

export interface MailMessage {
  subject: string;
  greeting?: string;
  lines?: string[];
  action?: { text: string; url: string };
}

@Injectable()
export class MailChannel {
  async send(to: string | string[], message: MailMessage): Promise<void> {
    // Stub transport: integrate real mailer later
    // For now, just no-op or console log could be added by caller
    return;
  }
}
