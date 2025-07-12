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
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PaquetesService } from './paquetes.service';
import { Paquete } from './entidades/paquete.entity';
import { CreatePaqueteDto } from './dto/paquete/create-paquete.dto';
import { UpdatePaqueteDto } from './dto/paquete/update-paquete.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Imagen } from './entidades/imagen.entity';
import { ImageHandlerService } from '../utils/image-handler.service';

@Controller('paquetes')
export class PaquetesController {
  constructor(
    private readonly paquetesService: PaquetesService,
    private readonly imageHandlerService: ImageHandlerService, // Inyecta el servicio de imágenes
  ) {}

  @Get()
  findAll(): Promise<Paquete[]> {
    return this.paquetesService.findAll();
  }

  @Get(':identificador')
  async findOne(
    @Param('identificador') identificador: string,
  ): Promise<Paquete> {
    let paquete: Paquete | null = null;

    // Valida si el identificador es un UUID (para el id)
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

  /**
   * Nuevo endpoint para subir imágenes codificadas en Base64.
   * Espera un cuerpo de solicitud con una propiedad "image" que contiene la cadena Base64.
   * @param {string} base64Image - La imagen codificada en Base64.
   * @returns El objeto con la URL y la ruta de la imagen guardada.
   */
  @Post('upload-base64')
  async uploadImageFromBase64(@Body('image') base64Image: string) {
    if (!base64Image || typeof base64Image !== 'string') {
      throw new BadRequestException('No se proporcionó una imagen válida en formato Base64.');
    }
    try {
      return await this.imageHandlerService.saveImageFromBase64(base64Image);
    } catch (error) {
        throw new BadRequestException(`Error al procesar la imagen: ${error.message}`);
    }
  }
}