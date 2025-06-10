import { Module } from '@nestjs/common';
import { BasicAuthGuard } from './basic-auth.middleware';

@Module({
  providers: [BasicAuthGuard],
  exports: [BasicAuthGuard],
})
export class MiddlewareModule {} 