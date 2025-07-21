import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { PaquetesService } from './paquetes.service';
import { Paquete } from './entidades/paquete.entity';
import { CreatePaqueteDto } from './dto/paquete/create-paquete.dto';
import { UpdatePaqueteDto } from './dto/paquete/update-paquete.dto';
import { ImageHandlerService } from '../utils/image-handler.service';
import { Response } from 'express';

@Controller('paquetes')
export class PaquetesController {
  constructor(
    private readonly paquetesService: PaquetesService,
    private readonly imageHandlerService: ImageHandlerService,
  ) {}

  @Get('export/excel/:id')
  async exportToExcel(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.paquetesService.exportToExcel(id);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=paquete-${id}.xlsx`,
    );
    res.send(buffer);
  }

  @Get()
  findAll(): Promise<Paquete[]> {
    return this.paquetesService.findAll();
  }

  @Get(':identificador')
  async findOne(
    @Param('identificador') identificador: string,
  ): Promise<Paquete> {
    let paquete: Paquete | null = null;

    if (
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        identificador,
      )
    ) {
      paquete = await this.paquetesService.findOneById(identificador);
    } else {
      paquete = await this.paquetesService.findOneByUrl(identificador);
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaqueteDto: UpdatePaqueteDto) {
    return this.paquetesService.update(id, updatePaqueteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paquetesService.remove(id);
  }
}
