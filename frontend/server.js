const http = require('http');
const { readFile } = require('fs/promises');
const { extname, join, normalize } = require('path');

const port = Number(process.env.FRONTEND_PORT || 5173);
const root = __dirname;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

http
  .createServer(async (request, response) => {
    try {
      const url = new URL(request.url, `http://localhost:${port}`);
      const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname;
      const filePath = normalize(join(root, requestedPath));

      if (!filePath.startsWith(root)) {
        response.writeHead(403);
        response.end('Acceso no permitido');
        return;
      }

      const body = await readFile(filePath);
      response.writeHead(200, {
        'Content-Type': types[extname(filePath)] || 'application/octet-stream',
      });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end('No encontrado');
    }
  })
  .listen(port, () => {
    console.log(`Frontend de Nuestra Biblioteca listo en http://localhost:${port}`);
  });
