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
import { CreateImagenUrlDto } from './dto/create-imagen-url.dto'; // Importamos el nuevo DTO

@Controller('imagenes')
export class ImagenController {
  constructor(private readonly imagenService: ImagenService) {}

  /**
   * Endpoint para subir una imagen en formato Base64.
   */
  @Post('upload')
  createFromBase64(@Body() createImagenDto: CreateImagenDto) {
    if (!createImagenDto.image) {
      throw new BadRequestException('No se ha proporcionado una imagen en formato Base64.');
    }
    return this.imagenService.createFromBase64(createImagenDto);
  }

  /**
   * NUEVO: Endpoint para procesar una imagen desde una URL.
   */
  @Post('upload-from-url')
  createFromUrl(@Body() createImagenUrlDto: CreateImagenUrlDto) {
    return this.imagenService.createFromUrl(createImagenUrlDto);
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