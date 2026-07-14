import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { addDays, isAfter } from 'date-fns';
import { PrismaService } from '../prisma.service';
import { ApproveLoanDto } from './dto/approve-loan.dto';
import { RequestLoanDto } from './dto/request-loan.dto';

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  private readonly baseLoanCost = 2;
  private readonly finePerLateDay = 1;

  private getLoanRule(roleName: string) {
    if (roleName === 'PROFESOR') {
      return {
        days: 30,
        discountPercent: 100,
        finalCost: 0,
        documentType: 'Credencial docente',
      };
    }

    if (roleName === 'ESTUDIANTE') {
      return {
        days: 15,
        discountPercent: 50,
        finalCost: this.baseLoanCost * 0.5,
        documentType: 'Carnet estudiantil',
      };
    }

    return {
      days: 10,
      discountPercent: 0,
      finalCost: this.baseLoanCost,
      documentType: 'Cedula',
    };
  }

  private calculateLateDays(returnDate: Date, dueDate: Date) {
    if (!isAfter(returnDate, dueDate)) return 0;
    const diffTime = returnDate.getTime() - dueDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  async requestLoan(userId: number, dto: RequestLoanDto) {
    return this.prisma.$transaction(async (tx) => {
      const activeCount = await tx.loan.count({
        where: {
          userId,
          status: { in: ['Pendiente', 'Activo', 'Renovacion pendiente'] },
        },
      });
      if (activeCount >= 3) {
        throw new BadRequestException('Ningun usuario puede tener mas de tres prestamos activos.');
      }

      const existing = await tx.loan.findFirst({
        where: {
          userId,
          bookId: dto.bookId,
          status: { in: ['Pendiente', 'Activo', 'Renovacion pendiente'] },
        },
      });
      if (existing) {
        throw new BadRequestException('Ya tienes una solicitud o prestamo activo para este libro.');
      }

      const availableCopies = await tx.bookCopy.count({
        where: { bookId: dto.bookId, status: 'DISPONIBLE' },
      });
      if (availableCopies === 0) {
        throw new BadRequestException('No hay ejemplares disponibles para este libro en este momento.');
      }

      return tx.loan.create({
        data: {
          userId,
          bookId: dto.bookId,
          status: 'Pendiente',
          documentType: dto.documentType,
        },
        include: { book: true },
      });
    });
  }

  async approveLoan(loanId: number, adminId: number, dto: ApproveLoanDto) {
    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id: loanId },
        include: { user: { include: { role: true } } },
      });
      if (!loan) throw new NotFoundException('Solicitud no encontrada');
      if (loan.status !== 'Pendiente') {
        throw new BadRequestException('La solicitud no esta en estado pendiente');
      }

      const copy = await tx.bookCopy.findUnique({ where: { id: dto.bookCopyId } });
      if (!copy || copy.bookId !== loan.bookId) {
        throw new BadRequestException('Ejemplar invalido');
      }
      if (copy.status !== 'DISPONIBLE') {
        throw new BadRequestException('El ejemplar no esta disponible');
      }

      const rule = this.getLoanRule(loan.user.role.name);
      const loanDate = new Date();
      const dueDate = addDays(loanDate, rule.days);

      await tx.bookCopy.update({
        where: { id: copy.id },
        data: { status: 'PRESTADO' },
      });

      return tx.loan.update({
        where: { id: loan.id },
        data: {
          status: 'Activo',
          bookCopyId: copy.id,
          loanDate,
          dueDate,
          documentType: dto.documentType || loan.documentType || rule.documentType,
          baseCost: this.baseLoanCost,
          discountPercent: rule.discountPercent,
          finalCost: rule.finalCost,
          fineAmount: 0,
          approvedById: adminId,
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

  async returnLoan(loanId: number, registeredById?: number) {
    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id: loanId },
        include: { user: { include: { role: true } } },
      });
      if (!loan || (loan.status !== 'Activo' && loan.status !== 'Renovacion pendiente')) {
        throw new BadRequestException('El prestamo no esta activo');
      }

      const returnDate = new Date();
      const lateDays = loan.dueDate ? this.calculateLateDays(returnDate, loan.dueDate) : 0;
      const fineAmount =
        loan.user.role.name === 'CLIENTE' ? lateDays * this.finePerLateDay : 0;
      const status = fineAmount > 0 ? 'Devuelto con retraso' : 'Devuelto';

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
          finalCost: Number(loan.finalCost) + fineAmount,
          returnRegisteredById: registeredById,
        },
        include: { book: true, bookCopy: true, user: true },
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
