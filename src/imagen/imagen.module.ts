import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Imagen } from './entidades/imagen.entity';
import { Paquete } from '../paquetes/entidades/paquete.entity';
import { Hotel } from '../hoteles/entidades/hotel.entity';
import { Vuelo } from '../vuelos/entidades/vuelo.entity';
import { ImagenService } from './imagen.service';
import { ImagenController } from './imagen.controller';
import { ImageHandlerService } from './image-handler.service';

@Module({
  imports: [TypeOrmModule.forFeature([Imagen, Paquete, Hotel, Vuelo])],
  providers: [ImagenService, ImageHandlerService],
  controllers: [ImagenController],
  exports: [ImageHandlerService, ImagenService],
})
export class ImagenModule {}
