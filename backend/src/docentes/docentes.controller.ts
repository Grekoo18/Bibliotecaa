import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DocentesService } from './docentes.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

interface CreateDocenteDto {
  rfid?: string;
  nombre: string;
  iniciales?: string;
  rol?: string;
  tipoPersona?: string;
  carreras?: {
    nombre: string;
    ciclos: { numero: number; materias: string[] }[];
  }[];
}

type UpdateDocenteDto = Partial<
  Pick<CreateDocenteDto, 'rfid' | 'nombre' | 'iniciales' | 'rol'>
>;

@Controller('docentes')
export class DocentesController {
  constructor(private readonly service: DocentesService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('rfid/:uid')
  findByRfid(@Param('uid') uid: string) {
    return this.service.findByRfid(uid);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() body: CreateDocenteDto) {
    return this.service.create(body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateDocenteDto) {
    return this.service.update(Number(id), body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
