import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupsModule } from './groups/groups.module';
import { SeedersModule } from './seeders/seeders.module';
import { PublicController } from './controllers/public.controller';
import { AdminController } from './controllers/admin.controller';
import { AuthController } from './controllers/auth.controller';
import { AuthModule } from './auth/auth.module';
import { ComponentsModule } from './components/components.module';
import { IncidentsModule } from './incidents/incidents.module';
import * as mongoose from 'mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationsModule } from './notifications/notifications.module';
import { SubscribersModule } from './subscribers/subscribers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        const user = configService.get<string>('MONGODB_USER');
        const pass = configService.get<string>('MONGODB_PASSWORD');

        return {
          uri,
          user,
          pass,
        };
      },
      inject: [ConfigService],
    }),
    GroupsModule,
    ComponentsModule,
    IncidentsModule,
    SeedersModule,
    AuthModule,
    EventEmitterModule.forRoot(),
    NotificationsModule,
    SubscribersModule,
  ],
  controllers: [PublicController, AdminController, AuthController],
  providers: [],
})
export class AppModule {}
