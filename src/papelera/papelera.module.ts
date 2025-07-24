import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Paquete } from '../paquetes/entidades/paquete.entity';
import { Hotel } from '../hoteles/entidades/hotel.entity';
import { Vuelo } from '../vuelos/entidades/vuelo.entity';
import { PapeleraController } from './papelera.controller';
import { PapeleraService } from './papelera.service';
import { ImagenModule } from '../imagen/imagen.module';
import { Imagen } from '../imagen/entidades/imagen.entity'; // <-- 1. Importa la entidad Imagen

@Module({
  imports: [
    TypeOrmModule.forFeature([Paquete, Hotel, Vuelo, Imagen]), // <-- 2. Añade Imagen aquí
    ImagenModule,
  ],
  controllers: [PapeleraController],
  providers: [PapeleraService],
})
export class PapeleraModule {}