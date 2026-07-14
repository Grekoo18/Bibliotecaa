# Backend

API de Nuestra Biblioteca hecha con NestJS y Prisma.

## Ejecutar

```bash
npm install
npm run start:dev
```

La API corre en:

```text
http://localhost:3001
```

## Configuracion

Revisa `.env` y coloca tu conexion real de PostgreSQL:

```env
DATABASE_URL=postgresql://usuario:clave@localhost:5432/biblioteca
JWT_SECRET=dev-secret-local-change-me
JWT_EXPIRES_IN=8h
PORT=3001
```

## Migraciones

```bash
npx prisma generate
npx prisma db push
```

## Crear usuarios de acceso

Despues de configurar `DATABASE_URL`, puedes preparar todo con:

```bash
npm run setup:db
```

Ese comando crea las tablas, roles, usuarios y libros de muestra. Si prefieres hacerlo paso a paso:

```bash
npx prisma db push
npm run seed
```

Credenciales por defecto:

```text
Administrador: admin@biblioteca.local / Password123!
Subadministrador: subadmin@biblioteca.local / Password123!
Bibliotecario: bibliotecario@biblioteca.local / Password123!
Cliente: cliente@biblioteca.local / Password123!
Profesor: profesor@biblioteca.local / Password123!
Estudiante: estudiante@biblioteca.local / Password123!
```
