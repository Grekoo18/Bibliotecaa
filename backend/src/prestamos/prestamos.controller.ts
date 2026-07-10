import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { PrestamosService } from './prestamos.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

interface AuthRequest extends Request {
  user: {
    id: number;
    rol: string;
    email: string;
    tipoPersona?: string;
  };
}

@Controller('prestamos')
export class PrestamosController {
  constructor(private readonly service: PrestamosService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'subadmin', 'bibliotecario')
  @Get('activos')
  findActivos() {
    return this.service.findActivos();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'subadmin', 'bibliotecario')
  @Get('docente/:id')
  findByDocente(@Param('id') id: string) {
    return this.service.findByDocente(Number(id));
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('usuario', 'admin', 'bibliotecario')
  @Get('mis')
  findMisPrestamos(@Req() req: AuthRequest) {
    return this.service.findMisPrestamos(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'bibliotecario')
  @Post()
  crear(@Body() body: { docenteId: number; libroId: number }) {
    return this.service.crear(body.docenteId, body.libroId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('usuario', 'admin', 'bibliotecario')
  @Post('solicitar')
  solicitar(
    @Req() req: AuthRequest,
    @Body()
    body: {
      libroId: number;
      tipoDocumento?: string;
      numeroDocumento?: string;
    },
  ) {
    return this.service.crearSolicitudUsuario(req.user.id, body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('usuario', 'admin', 'bibliotecario')
  @Patch('devolver/:id')
  devolver(@Req() req: AuthRequest, @Param('id') id: string) {
    const usuarioId = req.user.rol === 'usuario' ? req.user.id : undefined;
    return this.service.devolver(Number(id), usuarioId);
  }
}
