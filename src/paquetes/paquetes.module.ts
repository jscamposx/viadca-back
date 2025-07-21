import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaquetesService } from './paquetes.service';
import { PaquetesController } from './paquetes.controller';
import { Paquete } from './entidades/paquete.entity';
import { Hotel } from './entidades/hotel.entity';
import { Itinerario } from './entidades/itinerario.entity';
import { Vuelo } from '../vuelos/entidades/vuelo.entity'; // <-- Actualizado
import { ImageHandlerService } from '../utils/image-handler.service';
import { ImagenModule } from '../imagen/imagen.module';
import { Imagen } from '../imagen/entidades/imagen.entity';
import { VuelosModule } from '../vuelos/vuelos.module'; // <-- Añadido

@Module({
  imports: [
    TypeOrmModule.forFeature([Paquete, Hotel, Itinerario, Vuelo, Imagen]),
    ImagenModule,
    VuelosModule, // <-- Añadido
  ],
  controllers: [PaquetesController], // <-- VuelosController eliminado
  providers: [PaquetesService, ImageHandlerService], // <-- VuelosService eliminado
  exports: [TypeOrmModule],
})
export class PaquetesModule {}