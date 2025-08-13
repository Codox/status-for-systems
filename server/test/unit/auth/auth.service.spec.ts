import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../src/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

const mockConfig = () => ({
  get: jest.fn((key: string) => {
    const map: Record<string, any> = {
      BASIC_AUTH_USERNAME: 'admin',
      BASIC_AUTH_PASSWORD: 'password',
    };
    return map[key];
  }),
});

const mockJwt = () => ({
  sign: jest.fn(() => 'signed.jwt.token'),
});

describe('AuthService (unit)', () => {
  let service: AuthService;
  let config: jest.Mocked<ConfigService>;
  let jwt: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ConfigService, useFactory: mockConfig },
        { provide: JwtService, useFactory: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    config = module.get(ConfigService);
    jwt = module.get(JwtService);
  });

  describe('validateBasicAuth', () => {
    it('throws if header missing or invalid', () => {
      expect(() => service.validateBasicAuth('')).toThrow(UnauthorizedException);
      expect(() => service.validateBasicAuth('Bearer abc')).toThrow(UnauthorizedException);
    });

    it('throws if credentials not configured', () => {
      config.get.mockImplementation((key: string) => undefined as any);
      const creds = Buffer.from('admin:password').toString('base64');
      expect(() => service.validateBasicAuth(`Basic ${creds}`)).toThrow(UnauthorizedException);
    });

    it('returns true for matching credentials', () => {
      const creds = Buffer.from('admin:password').toString('base64');
      expect(service.validateBasicAuth(`Basic ${creds}`)).toBe(true);
    });

    it('returns false for non-matching credentials', () => {
      const creds = Buffer.from('admin:wrong').toString('base64');
      expect(service.validateBasicAuth(`Basic ${creds}`)).toBe(false);
    });
  });

  describe('login', () => {
    it('throws if credentials not configured', async () => {
      config.get.mockImplementation((key: string) => undefined as any);
      await expect(service.login('admin', 'password')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws for invalid credentials', async () => {
      await expect(service.login('admin', 'wrong')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('returns JWT for valid credentials', async () => {
      const res = await service.login('admin', 'password');
      expect(jwt.sign).toHaveBeenCalledWith({ username: 'admin', sub: 'admin' });
      expect(res.access_token).toBe('signed.jwt.token');
    });
  });

  describe('validateJwtPayload', () => {
    it('returns user object for valid payload', async () => {
      const user = await service.validateJwtPayload({ username: 'admin', sub: 'admin' });
      expect(user).toEqual({ username: 'admin', userId: 'admin' });
    });

    it('returns null for invalid payload', async () => {
      const user = await service.validateJwtPayload({ username: 'someone', sub: 'x' });
      expect(user).toBeNull();
    });
  });
});
