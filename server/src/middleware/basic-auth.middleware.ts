import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const adminUser = this.configService.get<string>('ADMIN_USER');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (!adminUser || !adminPassword) {
      throw new Error('ADMIN_USER and ADMIN_PASSWORD environment variables must be set');
    }

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    const [type, credentials] = authHeader.split(' ');

    if (type !== 'Basic') {
      throw new UnauthorizedException('Invalid authorization type');
    }

    const [username, password] = Buffer.from(credentials, 'base64')
      .toString('utf-8')
      .split(':');

    if (username !== adminUser || password !== adminPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return true;
  }
} 