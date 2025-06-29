import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaquetesService } from './paquetes.service';
import { PaquetesController } from './paquetes.controller';
import { Paquetes } from './paquetes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Paquetes])],
  providers: [PaquetesService],
  controllers: [PaquetesController],
})
export class PaquetesModule {}
