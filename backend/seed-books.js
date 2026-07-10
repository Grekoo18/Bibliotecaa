require('dotenv/config');

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const books = [
  {
    codigo: 'INF-001',
    titulo: 'Fundamentos de Programacion',
    autor: 'Luis Joyanes Aguilar',
    anio: 2021,
    categoria: 'Informatica',
    programa: 'Desarrollo de Software',
    editorial: 'McGraw Hill',
    isbn: '9788448198445',
    totalEjemplares: 6,
    disponibles: 6,
    descripcion: 'Introduccion practica a algoritmos, estructuras basicas y pensamiento computacional.',
  },
  {
    codigo: 'ADM-014',
    titulo: 'Administracion Moderna',
    autor: 'Stephen Robbins',
    anio: 2020,
    categoria: 'Administracion',
    programa: 'Gestion Empresarial',
    editorial: 'Pearson',
    isbn: '9786073243371',
    totalEjemplares: 4,
    disponibles: 4,
    descripcion: 'Conceptos actuales de gestion, liderazgo, control y toma de decisiones.',
  },
  {
    codigo: 'CON-022',
    titulo: 'Contabilidad General',
    autor: 'Pedro Zapata Sanchez',
    anio: 2019,
    categoria: 'Contabilidad',
    programa: 'Contabilidad y Auditoria',
    editorial: 'Ecoe Ediciones',
    isbn: '9789587718471',
    totalEjemplares: 5,
    disponibles: 5,
    descripcion: 'Registro contable, estados financieros y ejercicios de aplicacion.',
  },
  {
    codigo: 'EDU-008',
    titulo: 'Didactica General',
    autor: 'Antonio Medina Rivilla',
    anio: 2018,
    categoria: 'Educacion',
    programa: 'Educacion Basica',
    editorial: 'Pearson',
    isbn: '9788483225212',
    totalEjemplares: 3,
    disponibles: 3,
    descripcion: 'Estrategias de ensenanza, planificacion y evaluacion del aprendizaje.',
  },
  {
    codigo: 'MAT-030',
    titulo: 'Matematica Aplicada',
    autor: 'Erwin Kreyszig',
    anio: 2022,
    categoria: 'Matematica',
    programa: 'Ciencias Basicas',
    editorial: 'Wiley',
    isbn: '9781119455929',
    totalEjemplares: 4,
    disponibles: 4,
    descripcion: 'Herramientas matematicas para resolver problemas tecnicos y administrativos.',
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('Falta DATABASE_URL en .env. Configura PostgreSQL antes de crear libros.');
    process.exit(1);
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  for (const book of books) {
    await prisma.libro.upsert({
      where: { codigo: book.codigo },
      update: book,
      create: book,
    });
  }

  await prisma.$disconnect();
  console.log('Libros de presentacion listos.');
}

main().catch((error) => {
  console.error('No se pudieron crear los libros.');
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
