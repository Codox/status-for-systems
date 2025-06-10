import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupsModule } from './groups/groups.module';
import { SeedersModule } from './seeders/seeders.module';
import { PublicController } from './controllers/public.controller';
import { AdminController } from './controllers/admin.controller';
import { MiddlewareModule } from './middleware/middleware.module';
import { AuthModule } from './auth/auth.module';

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
    SeedersModule,
    AuthModule,
    MiddlewareModule,
  ],
  controllers: [PublicController, AdminController],
  providers: [],
})
export class AppModule {}
