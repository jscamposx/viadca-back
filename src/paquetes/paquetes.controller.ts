import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { PaquetesService } from './paquetes.service';
import { Paquetes } from './entidades/paquetes.entity';
import { CreatePaqueteDto } from './dto/create-paquete.dto';

@Controller('paquetes')
export class PaquetesController {
  constructor(private readonly paquetesService: PaquetesService) {}

  @Get()
  findAll(): Promise<Paquetes[]> {
    return this.paquetesService.findAll();
  }

  @Get(':identificador')
  async findOne(
    @Param('identificador') identificador: string,
  ): Promise<Paquetes> {
    let paquete: Paquetes | null = null;
    if (/^\d+$/.test(identificador)) {
      paquete = await this.paquetesService.findOne(parseInt(identificador, 10));
    } else {
      paquete = await this.paquetesService.findByUrl(identificador);
    }
    if (!paquete) {
      throw new NotFoundException(
        `Paquete con identificador "${identificador}" no encontrado`,
      );
    }
    return paquete;
  }

  @Post()
  create(@Body() createPaqueteDto: CreatePaqueteDto) {
    return this.paquetesService.create(createPaqueteDto);
  }
}
