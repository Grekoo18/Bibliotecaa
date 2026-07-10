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
ADMIN_EMAIL=admin@biblioteca.local
ADMIN_PASSWORD=Admin123!
BIBLIOTECARIO_EMAIL=bibliotecario@biblioteca.local
BIBLIOTECARIO_PASSWORD=Biblio123!
USUARIO_EMAIL=usuario@biblioteca.local
USUARIO_PASSWORD=Usuario123!
```

## Migraciones

```bash
npx prisma generate
npx prisma migrate deploy
```

## Crear usuarios de acceso

Despues de configurar `DATABASE_URL`, puedes preparar todo con:

```bash
npm run setup:db
```

Ese comando crea las tablas, los tres usuarios y 5 libros de muestra. Si prefieres hacerlo paso a paso:

```bash
npx prisma migrate deploy
npm run seed:users
npm run seed:books
```

Credenciales por defecto:

```text
Administrador: admin@biblioteca.local / Admin123!
Bibliotecario: bibliotecario@biblioteca.local / Biblio123!
Usuario: usuario@biblioteca.local / Usuario123!
```
