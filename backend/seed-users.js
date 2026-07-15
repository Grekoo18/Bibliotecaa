require('dotenv/config');

const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const roles = [
  'ADMIN',
  'SUBADMIN',
  'BIBLIOTECARIO',
  'CLIENTE',
  'PROFESOR',
  'ESTUDIANTE',
  'INVITADO',
];

const users = [
  {
    name: 'Administrador',
    email: process.env.ADMIN_EMAIL || 'admin@biblioteca.local',
    password: process.env.ADMIN_PASSWORD || 'Admin123!',
    roleName: 'ADMIN',
  },
  {
    name: 'Bibliotecario Jefe',
    email: process.env.BIBLIOTECARIO_EMAIL || 'bibliotecario@biblioteca.local',
    password: process.env.BIBLIOTECARIO_PASSWORD || 'Biblio123!',
    roleName: 'BIBLIOTECARIO',
  },
  {
    name: 'Subadministrador',
    email: process.env.SUBADMIN_EMAIL || 'subadmin@biblioteca.local',
    password: process.env.SUBADMIN_PASSWORD || 'Subadmin123!',
    roleName: 'SUBADMIN',
  },
  {
    name: 'Cliente',
    email: process.env.USUARIO_EMAIL || 'usuario@biblioteca.local',
    password: process.env.USUARIO_PASSWORD || 'Usuario123!',
    roleName: 'CLIENTE',
  },
  {
    name: 'Profesor',
    email: process.env.PROFESOR_EMAIL || 'maestro@biblioteca.local',
    password: process.env.PROFESOR_PASSWORD || 'Maestro123!',
    roleName: 'PROFESOR',
  },
  {
    name: 'Estudiante',
    email: process.env.ESTUDIANTE_EMAIL || 'estudiante@biblioteca.local',
    password: process.env.ESTUDIANTE_PASSWORD || 'Estudiante123!',
    roleName: 'ESTUDIANTE',
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('Falta DATABASE_URL en .env. Configura PostgreSQL antes de crear usuarios.');
    process.exit(1);
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, description: `Rol de ${roleName}` },
    });
  }

  for (const user of users) {
    const role = await prisma.role.findUnique({ where: { name: user.roleName } });
    if (!role) continue;

    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        password: hashedPassword,
        roleId: role.id,
        status: 'ACTIVE',
      },
      create: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        roleId: role.id,
        status: 'ACTIVE',
      },
    });
  }

  await prisma.$disconnect();

  console.log('Usuarios de acceso listos.');
  for (const user of users) {
    console.log(`${user.roleName}: ${user.email} / ${user.password}`);
  }
}

main().catch((error) => {
  console.error('No se pudieron crear los usuarios.');
  console.error(error.message);
  process.exit(1);
});
