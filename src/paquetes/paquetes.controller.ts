import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { PaquetesService } from './paquetes.service';
import { Paquetes } from './paquetes.entity';

@Controller('paquetes')
export class PaquetesController {
  constructor(private readonly paquetesService: PaquetesService) {}

  @Get()
  findAll(): Promise<Paquetes[]> {
    return this.paquetesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Paquetes> {
    const paquete = await this.paquetesService.findOne(+id);
    if (!paquete) {
      throw new NotFoundException(`Paquete with ID ${id} not found`);
    }
    return paquete;
  }

  @Post()
  create(@Body() paquete: Partial<Paquetes>): Promise<Paquetes> {
    return this.paquetesService.create(paquete);
  }
}
