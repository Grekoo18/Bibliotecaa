require('dotenv/config');

const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const users = [
  {
    nombre: 'Administrador',
    iniciales: 'ADM',
    email: process.env.ADMIN_EMAIL || 'admin@biblioteca.local',
    password: process.env.ADMIN_PASSWORD || 'Admin123!',
    rol: 'admin',
  },
  {
    nombre: 'Bibliotecario',
    iniciales: 'BIB',
    email: process.env.BIBLIOTECARIO_EMAIL || 'bibliotecario@biblioteca.local',
    password: process.env.BIBLIOTECARIO_PASSWORD || 'Biblio123!',
    rol: 'bibliotecario',
  },
  {
    nombre: 'Cliente',
    iniciales: 'USR',
    email: process.env.USUARIO_EMAIL || 'usuario@biblioteca.local',
    password: process.env.USUARIO_PASSWORD || 'Usuario123!',
    rol: 'usuario',
    tipoPersona: 'INVITADO',
  },
  {
    nombre: 'Maestro',
    iniciales: 'MTR',
    email: process.env.MAESTRO_EMAIL || 'maestro@biblioteca.local',
    password: process.env.MAESTRO_PASSWORD || 'Maestro123!',
    rol: 'usuario',
    tipoPersona: 'DOCENTE',
  },
  {
    nombre: 'Estudiante',
    iniciales: 'EST',
    email: process.env.ESTUDIANTE_EMAIL || 'estudiante@biblioteca.local',
    password: process.env.ESTUDIANTE_PASSWORD || 'Estudiante123!',
    rol: 'usuario',
    tipoPersona: 'ESTUDIANTE',
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

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.usuario.upsert({
      where: { email: user.email },
      update: {
        nombre: user.nombre,
        iniciales: user.iniciales,
        password: hashedPassword,
        rol: user.rol,
        tipoPersona: user.tipoPersona || 'DOCENTE',
      },
      create: {
        nombre: user.nombre,
        iniciales: user.iniciales,
        email: user.email,
        password: hashedPassword,
        rol: user.rol,
        tipoPersona: user.tipoPersona || 'DOCENTE',
      },
    });
  }

  await prisma.$disconnect();

  console.log('Usuarios de acceso listos.');
  for (const user of users) {
    console.log(`${user.rol}: ${user.email} / ${user.password}`);
  }
}

main().catch((error) => {
  console.error('No se pudieron crear los usuarios.');
  if (
    error.message.includes('does not exist in the current database') ||
    error.message.includes('not available')
  ) {
    console.error('Primero crea las tablas con: npx prisma migrate deploy');
    console.error('O ejecuta todo junto con: npm run setup:db');
  }
  console.error(error.message);
  process.exit(1);
});
