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
import { Imagen } from './entidades/imagen.entity'; // Importa la entidad Imagen

@Module({
  imports: [
    // Asegúrate de que todas las entidades utilizadas en este módulo estén aquí
    TypeOrmModule.forFeature([Paquete, Hotel, Itinerario, Vuelo, Imagen]),
  ],
  controllers: [PaquetesController, VuelosController],
  providers: [PaquetesService, VuelosService, ImageHandlerService],
  exports: [TypeOrmModule], // Exporta TypeOrmModule para que otros módulos puedan usar las entidades
})
export class PaquetesModule {}