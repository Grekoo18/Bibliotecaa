import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private withoutPassword<T extends { password?: string }>(user: T) {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: { role: true },
      orderBy: { id: 'asc' },
    });
    return users.map((user) => this.withoutPassword(user));
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    return this.withoutPassword(user);
  }

  async create(data: CreateUserDto) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: passwordHash,
        roleId: data.roleId,
      },
      include: { role: true },
    });
    return this.withoutPassword(user);
  }

  async update(id: number, data: UpdateUserDto) {
    let passwordHash = data.password;
    if (data.password) {
      passwordHash = await bcrypt.hash(data.password, 10);
    }
    
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        password: passwordHash,
      },
      include: { role: true },
    });
    return this.withoutPassword(user);
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
