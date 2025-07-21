import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vuelo } from './entidades/vuelo.entity';
import { VuelosService } from './vuelos.service';
import { VuelosController } from './vuelos.controller';
import { Imagen } from '../imagen/entidades/imagen.entity';
import { ImagenModule } from '../imagen/imagen.module';

@Module({
  imports: [TypeOrmModule.forFeature([Vuelo, Imagen]), ImagenModule],
  controllers: [VuelosController],
  providers: [VuelosService],
  exports: [TypeOrmModule, VuelosService],
})
export class VuelosModule {}