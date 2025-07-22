import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaquetesService } from './paquetes.service';
import { PaquetesController } from './paquetes.controller';
import { Paquete } from './entidades/paquete.entity';
import { Itinerario } from './entidades/itinerario.entity';

import { ImagenModule } from '../imagen/imagen.module';
import { Imagen } from '../imagen/entidades/imagen.entity';
import { VuelosModule } from '../vuelos/vuelos.module';
import { HotelesModule } from '../hoteles/hoteles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Paquete, Itinerario, Imagen]),
    ImagenModule,
    VuelosModule,
    HotelesModule,
  ],
  controllers: [PaquetesController],
  providers: [PaquetesService],
  exports: [TypeOrmModule],
})
export class PaquetesModule {}
