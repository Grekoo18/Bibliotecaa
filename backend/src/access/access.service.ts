import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AccessService {
  constructor(private prisma: PrismaService) {}

  async findAllRoles() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true }
        }
      },
      orderBy: { id: 'asc' }
    });
  }

  async findAllPermissions() {
    return this.prisma.permission.findMany();
  }
}
