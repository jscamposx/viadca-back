// src/paquetes/paquetes.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaquetesService } from './paquetes.service';
import { PaquetesController } from './paquetes.controller';
import { Paquete } from './entidades/paquete.entity';
import { Imagen } from './entidades/imagen.entity';
import { Hotel } from './entidades/hotel.entity';
import { Itinerario } from './entidades/itinerario.entity';
import { ImageHandlerService } from '../utils/image-handler.service'; // Importa el nuevo servicio

@Module({
  imports: [TypeOrmModule.forFeature([Paquete, Imagen, Hotel, Itinerario])],
  controllers: [PaquetesController],
  providers: [PaquetesService, ImageHandlerService], // Añádelo a los providers
})
export class PaquetesModule {}