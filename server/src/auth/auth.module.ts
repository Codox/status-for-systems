import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BasicAuthGuard } from './basic-auth.guard';

@Module({
  providers: [AuthService, BasicAuthGuard],
  exports: [AuthService, BasicAuthGuard],
})
export class AuthModule {} 