import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const defaultPassword = 'Password123!';

async function upsertRole(name: string) {
  return prisma.role.upsert({
    where: { name },
    update: { description: `Rol de ${name}` },
    create: { name, description: `Rol de ${name}` },
  });
}

async function upsertPermission(name: string) {
  return prisma.permission.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

async function upsertBook(data: {
  title: string;
  isbn: string;
  authorName: string;
  categoryName: string;
  stock: number;
  description?: string;
  publicationYear?: number;
  publisher?: string;
  copyCodes: string[];
}) {
  const author =
    (await prisma.author.findFirst({ where: { name: data.authorName } })) ??
    (await prisma.author.create({ data: { name: data.authorName } }));

  const category = await prisma.category.upsert({
    where: { name: data.categoryName },
    update: {},
    create: { name: data.categoryName },
  });

  const book = await prisma.book.upsert({
    where: { isbn: data.isbn },
    update: {
      title: data.title,
      description: data.description,
      publicationYear: data.publicationYear,
      publisher: data.publisher,
      stock: data.stock,
      available: true,
      authorId: author.id,
      categoryId: category.id,
    },
    create: {
      title: data.title,
      isbn: data.isbn,
      description: data.description,
      publicationYear: data.publicationYear,
      publisher: data.publisher,
      stock: data.stock,
      available: true,
      authorId: author.id,
      categoryId: category.id,
    },
  });

  for (const code of data.copyCodes) {
    await prisma.bookCopy.upsert({
      where: { code },
      update: { bookId: book.id },
      create: { code, bookId: book.id, status: 'DISPONIBLE' },
    });
  }
}

async function main() {
  console.log('Iniciando seed de base de datos...');

  const roles = [
    'ADMIN',
    'SUBADMIN',
    'BIBLIOTECARIO',
    'CLIENTE',
    'PROFESOR',
    'ESTUDIANTE',
    'INVITADO',
  ];
  for (const roleName of roles) {
    await upsertRole(roleName);
  }
  console.log('Roles creados');

  const permissions = [
    'books.read',
    'books.manage',
    'users.manage',
    'loans.manage',
    'loans.create',
    'loans.read',
    'authors.read',
    'categories.read',
  ];
  for (const permissionName of permissions) {
    await upsertPermission(permissionName);
  }
  console.log('Permisos creados');

  const allPermissions = await prisma.permission.findMany();
  const rolePermissionMap: Record<string, string[]> = {
    ADMIN: permissions,
    SUBADMIN: ['books.read', 'users.manage', 'loans.manage', 'loans.read', 'authors.read', 'categories.read'],
    BIBLIOTECARIO: ['books.read', 'books.manage', 'loans.manage', 'loans.read', 'authors.read', 'categories.read'],
    CLIENTE: ['books.read', 'loans.create', 'loans.read'],
    PROFESOR: ['books.read', 'loans.create', 'loans.read'],
    ESTUDIANTE: ['books.read', 'loans.create', 'loans.read'],
    INVITADO: ['books.read'],
  };

  for (const [roleName, rolePermissions] of Object.entries(rolePermissionMap)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) continue;
    for (const permission of allPermissions.filter((item) => rolePermissions.includes(item.name))) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }
  console.log('Permisos asignados');

  const password = await bcrypt.hash(defaultPassword, 10);
  const users = [
    { email: 'admin@biblioteca.local', name: 'Administrador', roleName: 'ADMIN' },
    { email: 'subadmin@biblioteca.local', name: 'Subadministrador', roleName: 'SUBADMIN' },
    { email: 'bibliotecario@biblioteca.local', name: 'Bibliotecario Jefe', roleName: 'BIBLIOTECARIO' },
    { email: 'cliente@biblioteca.local', name: 'Cliente Normal', roleName: 'CLIENTE' },
    { email: 'estudiante@biblioteca.local', name: 'Estudiante Universitario', roleName: 'ESTUDIANTE' },
    { email: 'profesor@biblioteca.local', name: 'Profesor Titular', roleName: 'PROFESOR' },
  ];

  for (const user of users) {
    const role = await prisma.role.findUnique({ where: { name: user.roleName } });
    if (!role) continue;
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        password,
        roleId: role.id,
        status: 'ACTIVE',
      },
      create: {
        name: user.name,
        email: user.email,
        password,
        roleId: role.id,
      },
    });
  }
  console.log('Usuarios creados');

  await upsertBook({
    title: 'Cien Anos de Soledad',
    isbn: '978-0307474728',
    authorName: 'Gabriel Garcia Marquez',
    categoryName: 'Ficcion',
    stock: 2,
    description: 'Novela esencial del realismo magico latinoamericano.',
    publicationYear: 1967,
    publisher: 'Sudamericana',
    copyCodes: ['B1-C1', 'B1-C2'],
  });

  await upsertBook({
    title: 'El Senor de los Anillos',
    isbn: '978-0544003415',
    authorName: 'J.R.R. Tolkien',
    categoryName: 'Fantasia',
    stock: 1,
    description: 'Aventura epica en la Tierra Media.',
    publicationYear: 1954,
    publisher: 'Allen & Unwin',
    copyCodes: ['B2-C1'],
  });

  await upsertBook({
    title: 'Clean Code',
    isbn: '978-0132350884',
    authorName: 'Robert C. Martin',
    categoryName: 'Programacion',
    stock: 2,
    description: 'Buenas practicas para escribir codigo claro y mantenible.',
    publicationYear: 2008,
    publisher: 'Prentice Hall',
    copyCodes: ['B3-C1', 'B3-C2'],
  });

  await upsertBook({
    title: 'Dune',
    isbn: '978-0441172719',
    authorName: 'Frank Herbert',
    categoryName: 'Ciencia ficcion',
    stock: 2,
    description: 'Intriga politica, ecologia y aventura en Arrakis.',
    publicationYear: 1965,
    publisher: 'Chilton Books',
    copyCodes: ['B4-C1', 'B4-C2'],
  });

  await upsertBook({
    title: '1984',
    isbn: '978-0451524935',
    authorName: 'George Orwell',
    categoryName: 'Distopia',
    stock: 2,
    description: 'Novela clave sobre vigilancia, poder y libertad.',
    publicationYear: 1949,
    publisher: 'Secker & Warburg',
    copyCodes: ['B5-C1', 'B5-C2'],
  });

  console.log('Catalogo creado');
  console.log(`Credenciales: todos los usuarios usan ${defaultPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
