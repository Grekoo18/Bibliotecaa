import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrestamosService {
  constructor(private prisma: PrismaService) {}

  findActivos() {
    return this.prisma.prestamo.findMany({
      where: { activo: true },
      include: { usuario: true, libro: true },
      orderBy: { fechaPrestamo: 'desc' },
    });
  }

  findByDocente(usuarioId: number) {
    return this.prisma.prestamo.findMany({
      where: { usuarioId, activo: true },
      include: { usuario: true, libro: true },
      orderBy: { fechaPrestamo: 'desc' },
    });
  }

  findMisPrestamos(usuarioId: number) {
    return this.prisma.prestamo.findMany({
      where: { usuarioId, activo: true },
      include: { usuario: true, libro: true },
      orderBy: { fechaPrestamo: 'desc' },
    });
  }

  async crear(
    usuarioId: number,
    libroId: number,
    datosInvitado?: {
      nombreInvitado?: string;
      tipoDocumento?: string;
      numeroDocumento?: string;
    },
  ) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });
    if (!usuario) throw new BadRequestException('Usuario no encontrado');

    const libro = await this.prisma.libro.findUnique({ where: { id: libroId } });
    if (!libro) throw new BadRequestException('Libro no encontrado');
    if (libro.disponibles <= 0) {
      throw new BadRequestException('No hay ejemplares disponibles');
    }

    if (usuario.prestamosActivos >= 3) {
      throw new BadRequestException(
        'Ningun usuario puede tener mas de tres prestamos activos',
      );
    }

    const tipoDocumento =
      datosInvitado?.tipoDocumento ||
      (usuario.tipoPersona === 'DOCENTE'
        ? 'Credencial docente'
        : usuario.tipoPersona === 'ESTUDIANTE'
          ? 'Carnet estudiantil'
          : 'Cedula');
    const detalleRegla =
      usuario.tipoPersona === 'DOCENTE'
        ? 'Prestamo gratuito para profesor'
        : usuario.tipoPersona === 'ESTUDIANTE'
          ? 'Prestamo con 50% de descuento para estudiante'
          : 'Prestamo por 10 dias; aplica multa por retraso';

    const [prestamo] = await this.prisma.$transaction([
      this.prisma.prestamo.create({
        data: {
          usuarioId,
          libroId,
          nombreInvitado: datosInvitado?.nombreInvitado,
          tipoDocumento,
          numeroDocumento: datosInvitado?.numeroDocumento,
        },
        include: { usuario: true, libro: true },
      }),
      this.prisma.libro.update({
        where: { id: libroId },
        data: { disponibles: { decrement: 1 } },
      }),
      this.prisma.usuario.update({
        where: { id: usuarioId },
        data: { prestamosActivos: { increment: 1 } },
      }),
      this.prisma.registro.create({
        data: {
          tipo: 'prestamo',
          usuarioId,
          libroId,
          detalle: `${detalleRegla}. Documento entregado: ${tipoDocumento}`,
        },
      }),
    ]);
    return prestamo;
  }

  crearSolicitudUsuario(
    usuarioId: number,
    body: {
      libroId: number;
      tipoDocumento?: string;
      numeroDocumento?: string;
    },
  ) {
    return this.crear(usuarioId, body.libroId, {
      tipoDocumento: body.tipoDocumento,
      numeroDocumento: body.numeroDocumento,
    });
  }

  async devolver(prestamoId: number, usuarioId?: number) {
    const prestamo = await this.prisma.prestamo.findUnique({
      where: { id: prestamoId },
    });
    if (!prestamo) throw new BadRequestException('Prestamo no encontrado');
    if (usuarioId && prestamo.usuarioId !== usuarioId) {
      throw new BadRequestException('No puedes devolver prestamos de otro usuario');
    }
    if (!prestamo.activo) {
      throw new BadRequestException('El prestamo ya fue devuelto');
    }

    const [actualizado] = await this.prisma.$transaction([
      this.prisma.prestamo.update({
        where: { id: prestamoId },
        data: { activo: false, fechaDevolucion: new Date() },
        include: { usuario: true, libro: true },
      }),
      this.prisma.libro.update({
        where: { id: prestamo.libroId },
        data: { disponibles: { increment: 1 } },
      }),
      this.prisma.usuario.update({
        where: { id: prestamo.usuarioId },
        data: { prestamosActivos: { decrement: 1 } },
      }),
      this.prisma.registro.create({
        data: {
          tipo: 'devolucion',
          usuarioId: prestamo.usuarioId,
          libroId: prestamo.libroId,
          detalle: 'Devolucion registrada',
        },
      }),
    ]);
    return actualizado;
  }
}
