import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  ParseIntPipe,
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

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Paquetes> {
    const paquete = await this.paquetesService.findOne(id);
    if (!paquete) {
      throw new NotFoundException(`Paquete con ID ${id} no encontrado`);
    }
    return paquete;
  }

  @Post()
  create(@Body() createPaqueteDto: CreatePaqueteDto) {
    return this.paquetesService.create(createPaqueteDto);
  }
}
