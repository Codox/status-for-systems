import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  validateBasicAuth(authHeader: string): boolean {
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'ascii',
    );
    const [username, password] = credentials.split(':');

    const validUsername = this.configService.get<string>('BASIC_AUTH_USERNAME');
    const validPassword = this.configService.get<string>('BASIC_AUTH_PASSWORD');

    if (!validUsername || !validPassword) {
      throw new UnauthorizedException('Basic auth credentials not configured');
    }

    return username === validUsername && password === validPassword;
  }

  async login(
    username: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const validUsername = this.configService.get<string>('BASIC_AUTH_USERNAME');
    const validPassword = this.configService.get<string>('BASIC_AUTH_PASSWORD');

    if (!validUsername || !validPassword) {
      throw new UnauthorizedException('Auth credentials not configured');
    }

    if (username !== validUsername || password !== validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username, sub: 'admin' };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateJwtPayload(payload: any): Promise<any> {
    // Simple validation - in a real app you might check against a database
    const validUsername = this.configService.get<string>('BASIC_AUTH_USERNAME');

    if (payload.username === validUsername) {
      return { username: payload.username, userId: payload.sub };
    }

    return null;
  }
}
