import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaquetesService } from './paquetes.service';
import { PaquetesController } from './paquetes.controller';
import { Paquetes } from './entidades/paquete.entity';
import { ImagenPaquete } from './entidades/imagen.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Paquetes, ImagenPaquete])],
  controllers: [PaquetesController],
  providers: [PaquetesService],
})
export class PaquetesModule {}
