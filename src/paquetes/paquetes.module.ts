import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaquetesService } from './paquetes.service';
import { PaquetesController } from './paquetes.controller';
import { Paquetes } from './entidades/paquetes.entity';
import { ImagenPaquete } from './entidades/imagen-paquete.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Paquetes, ImagenPaquete])],
  controllers: [PaquetesController],
  providers: [PaquetesService],
})
export class PaquetesModule {}
