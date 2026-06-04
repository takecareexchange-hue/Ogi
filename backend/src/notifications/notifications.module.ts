import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { NotificationsService } from './notifications/notifications.service';
import { NotificationProcessor, FollowUpProcessor } from './processor.service';
import { ProviderService } from './provider.service';
import { DatabaseModule } from '../database/database.module';
const RedisMock = require('ioredis-mock');

@Global()
@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    BullModule.forRoot({
      connection: new RedisMock(),
    }),
    BullModule.registerQueue({
      name: 'notification-queue',
    }),
    BullModule.registerQueue({
      name: 'follow-up-queue',
    }),
  ],
  providers: [NotificationsService, NotificationProcessor, FollowUpProcessor, ProviderService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
