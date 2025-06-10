import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
} 