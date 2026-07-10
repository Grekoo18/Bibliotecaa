import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

interface AuthUser {
  id: number;
  rol: string;
  email: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  register(
    @Body()
    body: {
      nombre: string;
      email: string;
      password: string;
      confirmPassword?: string;
      tipoPersona?: string;
    },
  ) {
    return this.authService.register(body);
  }

  // El frontend llama esto para verificar que el token sigue válido y obtener el rol
  @UseGuards(AuthGuard('jwt'))
  @Post('me')
  me(@Req() req: Request & { user: AuthUser }) {
    return req.user;
  }
}
