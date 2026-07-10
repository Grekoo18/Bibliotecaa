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
      usuario = await this.prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
        include: { role: true },
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
      rol: usuario.role.name,
      email: usuario.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.name,
        email: usuario.email,
        rol: usuario.role.name,
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
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw new BadRequestException('Ya existe un usuario con ese correo');
    }

    const clienteRole = await this.prisma.role.findUnique({ where: { name: 'CLIENTE' } });
    if (!clienteRole) {
      throw new ServiceUnavailableException('Falta inicializar roles en la BD');
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    const usuario = await this.prisma.user.create({
      data: {
        name: data.nombre.trim(),
        email,
        password: passwordHash,
        roleId: clienteRole.id,
      },
      include: { role: true },
    });

    const payload = {
      sub: usuario.id,
      rol: usuario.role.name,
      email: usuario.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.name,
        email: usuario.email,
        rol: usuario.role.name,
      },
    };
  }
}
