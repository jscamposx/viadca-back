// src/paquetes/paquetes.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PaquetesService } from './paquetes.service';
import { Paquete } from './entidades/paquete.entity'; // Corrected import
import { CreatePaqueteDto } from './dto/paquete/create-paquete.dto';
import { UpdatePaqueteDto } from './dto/paquete/update-paquete.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Imagen } from './entidades/imagen.entity'; // Corrected import
import { convertirAAvif } from '../utils/avif-converter.util';
import * as fs from 'fs';
import * as path from 'path';
import { UpdateImagenDto } from './dto/imagen/update-imagen.dto';

@Controller('paquetes')
export class PaquetesController {
  constructor(
    private readonly paquetesService: PaquetesService,
    @InjectRepository(Imagen)
    private readonly imagenRepo: Repository<Imagen>,
  ) {}

  @Get()
  findAll(): Promise<Paquete[]> {
    return this.paquetesService.findAll();
  }

  @Get(':identificador')
  async findOne(
    @Param('identificador') identificador: string,
  ): Promise<Paquete> {
    // ... (el código de este método se mantiene igual)
    let paquete: Paquete | null = null;
    if (/^\d+$/.test(identificador)) {
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

  // --- AÑADE ESTE MÉTODO ---
  @Post()
  create(@Body() createPaqueteDto: CreatePaqueteDto) {
    return this.paquetesService.create(createPaqueteDto);
  }
  
  //... aquí van los otros métodos que ya tenías (PATCH, DELETE, etc.)
}