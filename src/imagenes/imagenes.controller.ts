import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Get,
  Param,
  Res,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagenesService } from './imagenes.service';
import { CreateImagenDto } from './dto/create-imagen.dto';
import { convertirAAvif } from '../utils/avif-converter.util';
import { Response } from 'express';

@Controller('imagenes')
export class ImagenesController {
  constructor(private readonly imagenesService: ImagenesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('imagen'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createImagenDto: CreateImagenDto,
  ) {
    const avifBuffer = await convertirAAvif(file.buffer);

    return this.imagenesService.create({
      ...createImagenDto,
      imagen: avifBuffer,
      mime_type: 'image/avif',
    });
  }

  @Get()
  test() {
    return { mensaje: 'Controlador imagenes funciona' };
  }

  @Get(':id')
  async getImagen(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const imagen = await this.imagenesService.findOne(id);

    if (!imagen) {
      throw new NotFoundException('Imagen no encontrada');
    }

    res.setHeader('Content-Type', imagen.mime_type);
    res.send(imagen.imagen);
  }
}
