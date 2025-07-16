// src/paquetes/paquetes.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaquetesService } from './paquetes.service';
import { PaquetesController } from './paquetes.controller';
import { Paquete } from './entidades/paquete.entity';
import { Hotel } from './entidades/hotel.entity';
import { Itinerario } from './entidades/itinerario.entity';
import { Vuelo } from './entidades/vuelo.entity';
import { VuelosService } from './vuelos.service';
import { VuelosController } from './vuelos.controller';
import { ImageHandlerService } from '../utils/image-handler.service';
import { ImagenModule } from '../imagen/imagen.module';
import { Imagen } from '../imagen/entidades/imagen.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Paquete, Hotel, Itinerario, Vuelo, Imagen]),
    ImagenModule,
  ],
  controllers: [PaquetesController, VuelosController],
  providers: [PaquetesService, VuelosService, ImageHandlerService],
  exports: [TypeOrmModule],
})
export class PaquetesModule {}
