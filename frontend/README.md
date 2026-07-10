# Frontend

Interfaz visual de Nuestra Biblioteca.

## Ejecutar

Primero inicia el backend en otra terminal. Luego:

```bash
npm run start
```

Abre:

```text
http://localhost:5173
```

El frontend se conecta a:

```text
http://localhost:3001
```

## Inicios de sesion

El inicio tiene tres tarjetas: Administrador, Bibliotecario y Usuario.

```text
Administrador: admin@biblioteca.local / Admin123!
Bibliotecario: bibliotecario@biblioteca.local / Biblio123!
Usuario: usuario@biblioteca.local / Usuario123!
```

Antes de entrar, prepara datos desde `backend/`:

```bash
npm run setup:db
```

Eso crea usuarios y 5 libros de muestra.

Si quieres cambiar la URL de la API desde el navegador:

```js
localStorage.setItem('nuestra_biblioteca_api', 'http://localhost:3001')
```
