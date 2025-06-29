
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagenesController } from './imagenes.controller';
import { ImagenesService } from './imagenes.service';
import { Imagen } from './entidades/imagen.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Imagen])],
  controllers: [ImagenesController],
  providers: [ImagenesService],
  exports: [ImagenesService], 
})
export class ImagenesModule {}
