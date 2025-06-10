import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { LoginRequest } from 'src/auth/requests/login.request';

class LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginRequest: LoginRequest) {
    const user = await this.authService.validateUser(loginRequest.email, loginRequest.password);
    return this.authService.login(user);
  }
} 