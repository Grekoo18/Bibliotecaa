import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    let usuario;
    try {
      usuario = await this.prisma.usuario.findUnique({
        where: { email: email.trim().toLowerCase() },
      });
    } catch {
      throw new ServiceUnavailableException(
        'No se pudo conectar con la base de datos. Revisa DATABASE_URL y que PostgreSQL este activo.',
      );
    }

    if (!usuario || !usuario.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const valida = await bcrypt.compare(password, usuario.password);
    if (!valida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: usuario.id,
      rol: usuario.rol,
      email: usuario.email,
      tipoPersona: usuario.tipoPersona,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        tipoPersona: usuario.tipoPersona,
      },
    };
  }

  async register(data: {
    nombre: string;
    email: string;
    password: string;
    confirmPassword?: string;
    tipoPersona?: string;
  }) {
    if (data.confirmPassword && data.password !== data.confirmPassword) {
      throw new BadRequestException('Las contrasenas no coinciden');
    }

    const email = data.email.trim().toLowerCase();
    const exists = await this.prisma.usuario.findUnique({ where: { email } });
    if (exists) {
      throw new BadRequestException('Ya existe un usuario con ese correo');
    }

    const allowedPersonTypes = ['CLIENTE', 'ESTUDIANTE', 'PROFESOR'];
    const tipoPersona = allowedPersonTypes.includes(data.tipoPersona || '')
      ? data.tipoPersona
      : 'CLIENTE';
    const passwordHash = await bcrypt.hash(data.password, 10);
    const usuario = await this.prisma.usuario.create({
      data: {
        nombre: data.nombre.trim(),
        email,
        password: passwordHash,
        rol: 'usuario',
        tipoPersona,
      },
    });

    const payload = {
      sub: usuario.id,
      rol: usuario.rol,
      email: usuario.email,
      tipoPersona: usuario.tipoPersona,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        tipoPersona: usuario.tipoPersona,
      },
    };
  }
}
