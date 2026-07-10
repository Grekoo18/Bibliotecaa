import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando seed de base de datos...');

  // 1. Roles
  const roles = ['ADMIN', 'SUBADMIN', 'BIBLIOTECARIO', 'CLIENTE', 'PROFESOR', 'ESTUDIANTE', 'INVITADO'];
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, description: `Rol de ${roleName}` },
    });
  }
  console.log('Roles creados');

  // 2. Permisos
  const permissions = [
    'books.read', 'books.manage', 'users.manage', 'loans.manage', 
    'loans.create', 'loans.read', 'authors.read', 'categories.read'
  ];
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm },
      update: {},
      create: { name: perm },
    });
  }
  console.log('Permisos creados');

  // 3. Asignar Permisos a Roles (Simplificado para el demo)
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const clienteRole = await prisma.role.findUnique({ where: { name: 'CLIENTE' } });
  
  if (adminRole) {
    const allPerms = await prisma.permission.findMany();
    for (const p of allPerms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: adminRole.id, permissionId: p.id } },
        update: {},
        create: { roleId: adminRole.id, permissionId: p.id }
      });
    }
  }

  // 4. Usuarios
  const password = await bcrypt.hash('Password123!', 10);
  const users = [
    { email: 'admin@biblioteca.local', name: 'Administrador', roleName: 'ADMIN' },
    { email: 'bibliotecario@biblioteca.local', name: 'Bibliotecario Jefe', roleName: 'BIBLIOTECARIO' },
    { email: 'cliente@biblioteca.local', name: 'Cliente Normal', roleName: 'CLIENTE' },
    { email: 'estudiante@biblioteca.local', name: 'Estudiante Universitario', roleName: 'ESTUDIANTE' },
    { email: 'profesor@biblioteca.local', name: 'Profesor Titular', roleName: 'PROFESOR' },
  ];

  for (const u of users) {
    const role = await prisma.role.findUnique({ where: { name: u.roleName } });
    if (role) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          name: u.name,
          email: u.email,
          password: password,
          roleId: role.id
        }
      });
    }
  }
  console.log('Usuarios creados');

  // 5. Autores y Categorías
  const author1 = await prisma.author.create({ data: { name: 'Gabriel García Márquez' } });
  const author2 = await prisma.author.create({ data: { name: 'J.R.R. Tolkien' } });

  const cat1 = await prisma.category.upsert({ where: { name: 'Ficción' }, update: {}, create: { name: 'Ficción' } });
  const cat2 = await prisma.category.upsert({ where: { name: 'Fantasía' }, update: {}, create: { name: 'Fantasía' } });

  // 6. Libros y Copias
  const book1 = await prisma.book.create({
    data: {
      title: 'Cien Años de Soledad',
      isbn: '978-0307474728',
      stock: 2,
      available: true,
      authorId: author1.id,
      categoryId: cat1.id,
      copies: {
        create: [
          { code: 'B1-C1', status: 'DISPONIBLE' },
          { code: 'B1-C2', status: 'DISPONIBLE' }
        ]
      }
    }
  });

  const book2 = await prisma.book.create({
    data: {
      title: 'El Señor de los Anillos',
      isbn: '978-0544003415',
      stock: 1,
      available: true,
      authorId: author2.id,
      categoryId: cat2.id,
      copies: {
        create: [
          { code: 'B2-C1', status: 'DISPONIBLE' }
        ]
      }
    }
  });
  
  console.log('Catálogo creado');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
