import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'BIBLIOTECARIO')
  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Get()
  findAll(@Query('q') query?: string, @Query('category') category?: string) {
    return this.booksService.findAll(query, category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'BIBLIOTECARIO')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(+id, updateBookDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'BIBLIOTECARIO')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(+id);
  }

  // Exemplares (Copies)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'BIBLIOTECARIO')
  @Post(':id/copies')
  addCopy(@Param('id') id: string, @Body() body: { code: string; location?: string }) {
    return this.booksService.addCopy(+id, body.code, body.location);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'BIBLIOTECARIO')
  @Patch('copies/:copyId/status')
  updateCopyStatus(@Param('copyId') copyId: string, @Body() body: { status: string }) {
    return this.booksService.updateCopyStatus(+copyId, body.status);
  }

  // Calificaciones
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/rate')
  rateBook(@Param('id') id: string, @Body() body: { rating: number; comment?: string }, @Req() req: Request & { user: any }) {
    return this.booksService.rateBook(+id, req.user.id, body.rating, body.comment);
  }
}
