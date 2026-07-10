import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RequestLoanDto } from './dto/request-loan.dto';
import { ApproveLoanDto } from './dto/approve-loan.dto';
import { addDays, isAfter } from 'date-fns';

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  async requestLoan(userId: number, dto: RequestLoanDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Validar que no tenga ya un préstamo activo o pendiente de este libro
      const existing = await tx.loan.findFirst({
        where: {
          userId,
          bookId: dto.bookId,
          status: { in: ['Pendiente', 'Activo', 'Renovacion pendiente'] },
        },
      });
      if (existing) {
        throw new BadRequestException('Ya tienes una solicitud o préstamo activo para este libro.');
      }

      // 2. Validar que hayan ejemplares disponibles
      const availableCopies = await tx.bookCopy.count({
        where: { bookId: dto.bookId, status: 'DISPONIBLE' },
      });
      if (availableCopies === 0) {
        throw new BadRequestException('No hay ejemplares disponibles para este libro en este momento.');
      }

      // 3. Crear el préstamo como Pendiente
      return tx.loan.create({
        data: {
          userId,
          bookId: dto.bookId,
          status: 'Pendiente',
        },
        include: { book: true },
      });
    });
  }

  async approveLoan(loanId: number, adminId: number, dto: ApproveLoanDto) {
    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({ where: { id: loanId } });
      if (!loan) throw new NotFoundException('Solicitud no encontrada');
      if (loan.status !== 'Pendiente') throw new BadRequestException('La solicitud no está en estado pendiente');

      const copy = await tx.bookCopy.findUnique({ where: { id: dto.bookCopyId } });
      if (!copy || copy.bookId !== loan.bookId) throw new BadRequestException('Ejemplar inválido');
      if (copy.status !== 'DISPONIBLE') throw new BadRequestException('El ejemplar no está disponible');

      // Calcular fecha de devolución (ej: 7 días por defecto)
      const dueDate = addDays(new Date(), 7);

      // Actualizar ejemplar
      await tx.bookCopy.update({
        where: { id: copy.id },
        data: { status: 'PRESTADO' },
      });

      // Actualizar préstamo
      return tx.loan.update({
        where: { id: loan.id },
        data: {
          status: 'Activo',
          bookCopyId: copy.id,
          loanDate: new Date(),
          dueDate,
        },
        include: { book: true, bookCopy: true, user: true },
      });
    });
  }

  async rejectLoan(loanId: number, adminId: number, reason: string) {
    return this.prisma.loan.update({
      where: { id: loanId },
      data: { status: 'Rechazado' },
    });
  }

  async returnLoan(loanId: number) {
    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({ where: { id: loanId } });
      if (!loan || (loan.status !== 'Activo' && loan.status !== 'Renovacion pendiente')) {
        throw new BadRequestException('El préstamo no está activo');
      }

      const returnDate = new Date();
      let status = 'Devuelto';
      let fineAmount = 0;

      if (loan.dueDate && isAfter(returnDate, loan.dueDate)) {
        status = 'Devuelto con retraso';
        // Ej: $1 por día de retraso (sólo ejemplo simplificado)
        const diffTime = Math.abs(returnDate.getTime() - loan.dueDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        fineAmount = diffDays * 1.0; 
      }

      if (loan.bookCopyId) {
        await tx.bookCopy.update({
          where: { id: loan.bookCopyId },
          data: { status: 'DISPONIBLE' },
        });
      }

      return tx.loan.update({
        where: { id: loan.id },
        data: {
          status,
          returnDate,
          fineAmount,
        },
      });
    });
  }

  async getMyLoans(userId: number) {
    return this.prisma.loan.findMany({
      where: { userId },
      include: { book: true, bookCopy: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllLoans() {
    return this.prisma.loan.findMany({
      include: { book: true, bookCopy: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
