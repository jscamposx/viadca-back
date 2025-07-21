import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelesService } from './hoteles.service';
import { HotelesController } from './hoteles.controller';
import { Hotel } from './entidades/hotel.entity';
import { Imagen } from '../imagen/entidades/imagen.entity';
import { ImagenModule } from '../imagen/imagen.module';

@Module({
  imports: [TypeOrmModule.forFeature([Hotel, Imagen]), ImagenModule],
  controllers: [HotelesController],
  providers: [HotelesService],
  exports: [TypeOrmModule, HotelesService],
})
export class HotelesModule {}
