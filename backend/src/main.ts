import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Creamos la aplicación usando el AppModule
  const app = await NestFactory.create(AppModule);

  // Configuración de CORS para que tu Front (3001) hable con tu Back (3000)
  app.enableCors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    credentials: true,
  });

  // El Backend escuchará en el puerto 3000
  // En tu main.ts de NestJS
    await app.listen(3000, '0.0.0.0'); // Forzamos a que acepte conexiones de cualquier IP local
  console.log('Servidor corriendo en http://localhost:3000');
}
bootstrap();
