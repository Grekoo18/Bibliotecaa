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
          'Aprobar o rechazar préstamos',
          'Aprobar o rechazar renovaciones',
          'Registrar devoluciones',
          'Administrar usuarios',
          'Administrar libros',
        ],
      },
      {
        rol: 'subadmin',
        nombre: 'Subadministrador',
        permisos: ['Consultar catálogo', 'Consultar préstamos', 'Ver registros'],
      },
      {
        rol: 'bibliotecario',
        nombre: 'Bibliotecario',
        permisos: [
          'Aprobar o rechazar préstamos',
          'Aprobar o rechazar renovaciones',
          'Registrar devoluciones',
          'Gestionar inventario',
        ],
      },
      {
        rol: 'usuario',
        nombre: 'Usuario',
        permisos: [
          'Buscar libros',
          'Solicitar préstamo',
          'Cancelar solicitud',
          'Solicitar renovación',
          'Ver historial y préstamos activos',
        ],
      },
      {
        rol: 'invitado',
        nombre: 'Invitado',
        permisos: ['Consultar catálogo'],
      },
    ];
  }
}
