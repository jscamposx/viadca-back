// src/paquetes/paquetes.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaquetesService } from './paquetes.service';
import { PaquetesController } from './paquetes.controller';
import { Paquete } from './entidades/paquete.entity';      // ¡Corregido! Era Paquetes
import { Imagen } from './entidades/imagen.entity';        // ¡Corregido! Era ImagenPaquete
import { Hotel } from './entidades/hotel.entity';
import { Itinerario } from './entidades/itinerario.entity';

@Module({
  imports: [
    // Asegúrate de que todas tus entidades estén aquí
    TypeOrmModule.forFeature([Paquete, Imagen, Hotel, Itinerario]) 
  ],
  controllers: [PaquetesController],
  providers: [PaquetesService],
})
export class PaquetesModule {}