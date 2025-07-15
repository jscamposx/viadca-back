import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaquetesService } from './paquetes.service';
import { PaquetesController } from './paquetes.controller';
import { Paquete } from './entidades/paquete.entity';
import { Imagen } from './entidades/imagen.entity';
import { Hotel } from './entidades/hotel.entity';
import { Itinerario } from './entidades/itinerario.entity';
import { ImageHandlerService } from '../utils/image-handler.service';
import { Vuelo } from './entidades/vuelo.entity';
import { VuelosService } from './vuelos.service';
import { VuelosController } from './vuelos.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Paquete, Imagen, Hotel, Itinerario, Vuelo]),
  ],
  controllers: [PaquetesController, VuelosController],
  providers: [PaquetesService, VuelosService, ImageHandlerService],
})
export class PaquetesModule {}