import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LibrosService } from './libros.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('libros')
export class LibrosController {
  constructor(private readonly service: LibrosService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('conteo-por-programa')
  conteoPorPrograma() {
    return this.service.conteoPorPrograma();
  }

  @Get('programas')
  listaProgramas() {
    return this.service.listaProgramas();
  }

  @Get('buscar')
  buscar(@Query('texto') texto?: string, @Query('programa') programa?: string) {
    return this.service.buscar(texto, programa);
  }

  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.service.findByCodigo(codigo);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'bibliotecario')
  @Post()
  create(
    @Body()
    body: {
      codigo: string;
      titulo: string;
      autor: string;
      anio: number;
      categoria: string;
      totalEjemplares: number;
      disponibles: number;
      descripcion: string;
      tipo?: string;
      isbn?: string;
      codigoDewey?: string;
      codigoCutter?: string;
      edicion?: string;
      paginas?: number;
      editorial?: string;
      idioma?: string;
      soloEnSala?: boolean;
      programa?: string;
      palabrasClave?: string;
      citaBibliografica?: string;
    },
  ) {
    return this.service.create(body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'bibliotecario')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      titulo: string;
      autor: string;
      totalEjemplares: number;
      disponibles: number;
      categoria: string;
      isbn: string;
      editorial: string;
      programa: string;
    }>,
  ) {
    return this.service.update(Number(id), body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'bibliotecario')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
