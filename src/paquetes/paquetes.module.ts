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
import { ImagenModule } from '../imagen/imagen.module'; // Importamos el módulo centralizado
import { Imagen } from '../imagen/entidades/imagen.entity'; // La importación correcta de la entidad

@Module({
  imports: [
    TypeOrmModule.forFeature([Paquete, Hotel, Itinerario, Vuelo, Imagen]), // Mantenemos Imagen aquí para que el repositorio esté disponible en este módulo
    ImagenModule, // Importamos el módulo para acceder a sus servicios si es necesario
  ],
  controllers: [PaquetesController, VuelosController],
  providers: [PaquetesService, VuelosService, ImageHandlerService],
  exports: [TypeOrmModule],
})
export class PaquetesModule {}