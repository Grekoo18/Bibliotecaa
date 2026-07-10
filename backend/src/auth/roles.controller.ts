import { Controller, Get } from '@nestjs/common';

@Controller('roles')
export class RolesInfoController {
  @Get()
  findAll() {
    return [
      {
        rol: 'admin',
        nombre: 'Administrador',
        permisos: [
          'Gestionar usuarios',
          'Gestionar prestamos',
          'Editar y retirar libros',
          'Ver registros',
          'Ver roles y permisos',
        ],
      },
      {
        rol: 'subadmin',
        nombre: 'Subadministrador',
        permisos: ['Consultar catalogo', 'Consultar prestamos', 'Consultar registros'],
      },
      {
        rol: 'bibliotecario',
        nombre: 'Bibliotecario',
        permisos: [
          'Crear libros',
          'Crear prestamos',
          'Registrar devoluciones',
          'Consultar actividad',
        ],
      },
      {
        rol: 'usuario',
        nombre: 'Usuario',
        permisos: [
          'Ver libros',
          'Pedir libros',
          'Ver prestamos propios',
          'Devolver prestamos propios',
        ],
      },
      {
        rol: 'invitado',
        nombre: 'Invitado',
        permisos: ['Explorar catalogo', 'Ver disponibilidad'],
      },
    ];
  }
}
