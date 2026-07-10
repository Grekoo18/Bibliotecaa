# Nuestra Biblioteca

Proyecto organizado en dos carpetas separadas:

```text
nuestra-biblioteca-separada/
  backend/
  frontend/
```

## Backend

```bash
cd backend
npm install
npm run start:dev
```

El backend corre en:

```text
http://localhost:3001
```

Configura `backend/.env` con tu `DATABASE_URL` real para que carguen libros,
usuarios, prestamos y registros desde PostgreSQL. Luego prepara la base:

```bash
npm run setup:db
```

Ese comando crea tablas, usuarios y 5 libros de muestra.

Credenciales:

```text
Administrador: admin@biblioteca.local / Admin123!
Bibliotecario: bibliotecario@biblioteca.local / Biblio123!
Cliente: usuario@biblioteca.local / Usuario123!
Maestro: maestro@biblioteca.local / Maestro123!
Estudiante: estudiante@biblioteca.local / Estudiante123!
```

Reglas incluidas:

```text
Cliente: puede pedir libros, devolverlos y tiene prestamo de 10 dias con multa por retraso.
Maestro: puede pedir libros con prestamo gratuito.
Estudiante: puede pedir libros con 50% de descuento.
Bibliotecario: puede agregar, retirar libros, registrar prestamos y devoluciones.
Administrador: puede ver y administrar usuarios, catalogo, prestamos y registros.
Todos: maximo 3 prestamos activos por usuario.
```

## Frontend

Abre otra terminal:

```bash
cd frontend
npm run start
```

El frontend corre en:

```text
http://localhost:5173
```

El frontend se conecta al backend en `http://localhost:3001`.
