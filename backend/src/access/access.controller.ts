import { Controller, Get, UseGuards } from '@nestjs/common';
import { AccessService } from './access.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('access')
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  @Roles('ADMIN')
  @Get('roles')
  findAllRoles() {
    return this.accessService.findAllRoles();
  }

  @Roles('ADMIN')
  @Get('permissions')
  findAllPermissions() {
    return this.accessService.findAllPermissions();
  }
}
