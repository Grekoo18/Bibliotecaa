import { Controller, Get, Post, Body, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { LoansService } from './loans.service';
import { RequestLoanDto } from './dto/request-loan.dto';
import { ApproveLoanDto } from './dto/approve-loan.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  // Estudiantes solicitan
  @Post('request')
  requestLoan(@Body() dto: RequestLoanDto, @Req() req: Request & { user: any }) {
    return this.loansService.requestLoan(req.user.id, dto);
  }

  @Get('my-loans')
  getMyLoans(@Req() req: Request & { user: any }) {
    return this.loansService.getMyLoans(req.user.id);
  }

  // Bibliotecarios administran
  @Roles('ADMIN', 'SUBADMIN', 'BIBLIOTECARIO')
  @Get()
  getAllLoans() {
    return this.loansService.getAllLoans();
  }

  @Roles('ADMIN', 'SUBADMIN', 'BIBLIOTECARIO')
  @Patch(':id/approve')
  approveLoan(@Param('id') id: string, @Body() dto: ApproveLoanDto, @Req() req: Request & { user: any }) {
    return this.loansService.approveLoan(+id, req.user.id, dto);
  }

  @Roles('ADMIN', 'SUBADMIN', 'BIBLIOTECARIO')
  @Patch(':id/reject')
  rejectLoan(@Param('id') id: string, @Body('reason') reason: string, @Req() req: Request & { user: any }) {
    return this.loansService.rejectLoan(+id, req.user.id, reason);
  }

  @Roles('ADMIN', 'SUBADMIN', 'BIBLIOTECARIO')
  @Patch(':id/return')
  returnLoan(@Param('id') id: string) {
    return this.loansService.returnLoan(+id);
  }
}
