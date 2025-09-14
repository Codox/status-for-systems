import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { MailChannel } from './channels/mail.channel';

@Module({
  imports: [],
  providers: [NotificationsService, MailChannel],
  exports: [NotificationsService],
})
export class NotificationsModule {}
