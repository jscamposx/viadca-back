// src/imagen/imagen.controller.ts

import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { ImagenService } from './imagen.service';
import { CreateImagenDto } from './dto/create-imagen.dto';

@Controller('imagenes')
export class ImagenController {
  constructor(private readonly imagenService: ImagenService) {}

  /**
   * Endpoint unificado para subir una imagen desde Base64 o una URL.
   */
  @Post('upload')
  create(@Body() createImagenDto: CreateImagenDto) {
    if (!createImagenDto.image && !createImagenDto.url) {
      throw new BadRequestException(
        'Se debe proporcionar una imagen en formato Base64 o una URL.',
      );
    }
    // Llama a un nuevo método unificado en el servicio
    return this.imagenService.create(createImagenDto);
  }

  @Get()
  findAll() {
    return this.imagenService.findAll();
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.imagenService.remove(id);
  }
}
