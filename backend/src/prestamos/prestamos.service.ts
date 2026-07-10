import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrestamosService {
  constructor(private prisma: PrismaService) {}

  private readonly costoBasePrestamo = 2;
  private readonly multaPorDia = 1;

  private addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private loanRules(tipoPersona: string) {
    const normalized = tipoPersona.toUpperCase();

    if (normalized === 'DOCENTE' || normalized === 'PROFESOR') {
      return {
        tipoDocumento: 'Credencial docente',
        detalle: 'Prestamo gratuito para profesor',
        dias: 30,
        descuento: this.costoBasePrestamo,
      };
    }

    if (normalized === 'ESTUDIANTE') {
      return {
        tipoDocumento: 'Carnet estudiantil',
        detalle: 'Prestamo con 50% de descuento para estudiante',
        dias: 15,
        descuento: this.costoBasePrestamo * 0.5,
      };
    }

    return {
      tipoDocumento: 'Cedula',
      detalle: 'Prestamo para cliente por 10 dias; aplica multa por retraso',
      dias: 10,
      descuento: 0,
    };
  }

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

    const rules = this.loanRules(usuario.tipoPersona);
    const fechaPrestamo = new Date();
    const fechaLimite = this.addDays(fechaPrestamo, rules.dias);
    const tipoDocumento = datosInvitado?.tipoDocumento || rules.tipoDocumento;
    const costoFinal = Math.max(0, this.costoBasePrestamo - rules.descuento);

    const [prestamo] = await this.prisma.$transaction([
      this.prisma.prestamo.create({
        data: {
          usuarioId,
          libroId,
          fechaPrestamo,
          fechaLimite,
          nombreInvitado: datosInvitado?.nombreInvitado,
          tipoDocumento,
          numeroDocumento: datosInvitado?.numeroDocumento,
          costoBase: this.costoBasePrestamo,
          descuento: rules.descuento,
          costoFinal,
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
          detalle: `${rules.detalle}. Documento entregado: ${tipoDocumento}`,
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
      include: { usuario: true },
    });
    if (!prestamo) throw new BadRequestException('Prestamo no encontrado');
    if (usuarioId && prestamo.usuarioId !== usuarioId) {
      throw new BadRequestException('No puedes devolver prestamos de otro usuario');
    }
    if (!prestamo.activo) {
      throw new BadRequestException('El prestamo ya fue devuelto');
    }

    const hoy = new Date();
    const fechaLimite = prestamo.fechaLimite || this.addDays(prestamo.fechaPrestamo, 10);
    const diasRetraso = Math.max(
      0,
      Math.ceil((hoy.getTime() - fechaLimite.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const esCliente = ['CLIENTE', 'INVITADO'].includes(
      prestamo.usuario.tipoPersona.toUpperCase(),
    );
    const multa = esCliente ? diasRetraso * this.multaPorDia : 0;
    const costoFinal = Number(prestamo.costoBase) - Number(prestamo.descuento) + multa;

    const [actualizado] = await this.prisma.$transaction([
      this.prisma.prestamo.update({
        where: { id: prestamoId },
        data: {
          activo: false,
          estado: multa > 0 ? 'DEVUELTO_CON_MULTA' : 'DEVUELTO',
          fechaDevolucion: hoy,
          multa,
          costoFinal,
        },
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
          detalle:
            multa > 0
              ? `Devolucion registrada con multa de ${multa.toFixed(2)}`
              : 'Devolucion registrada',
        },
      }),
    ]);
    return actualizado;
  }
}
