import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getApiStatus() {
    return {
      name: 'Nuestra Biblioteca API',
      status: 'ok',
      frontend: 'Ejecuta la carpeta frontend por separado.',
    };
  }
}
