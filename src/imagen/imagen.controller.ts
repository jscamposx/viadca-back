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

  @Post('upload')
  create(@Body() createImagenDto: CreateImagenDto) {
    if (!createImagenDto.image && !createImagenDto.url) {
      throw new BadRequestException(
        'Se debe proporcionar una imagen en formato Base64 o una URL.',
      );
    }

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
