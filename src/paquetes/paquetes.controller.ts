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
import { Paquetes } from './entidades/paquetes.entity';
import { CreatePaqueteDto } from './dto/paquete/create-paquete.dto';
import { UpdatePaqueteDto } from './dto/paquete/update-paquete.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImagenPaquete } from './entidades/imagen-paquete.entity';
import { convertirAAvif } from '../utils/avif-converter.util';
import * as fs from 'fs';
import * as path from 'path';
import { UpdateImagenDto } from './dto/imagen/update-imagen.dto';

@Controller('paquetes')
export class PaquetesController {
  constructor(
    private readonly paquetesService: PaquetesService,
    @InjectRepository(ImagenPaquete)
    private readonly imagenRepo: Repository<ImagenPaquete>,
  ) {}

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
      paquete = await this.paquetesService.findOne(+identificador);
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

  @Patch(':url')
  update(
    @Param('url') url: string,
    @Body() updatePaqueteDto: UpdatePaqueteDto,
  ) {
    return this.paquetesService.updateByUrl(url, updatePaqueteDto);
  }

  @Delete(':url')
  remove(@Param('url') url: string) {
    return this.paquetesService.removeByUrl(url);
  }

  @Post(':url/imagenes')
  @UseInterceptors(FilesInterceptor('archivos'))
  async subirImagenes(
    @Param('url') url: string,
    @UploadedFiles() archivos: Express.Multer.File[],
    @Body('ordenes') ordenes: string,
  ) {
    const paquete = await this.paquetesService.findByUrl(url);
    if (!paquete) throw new NotFoundException('Paquete no encontrado');

    const ordenesArray: number[] = ordenes ? JSON.parse(ordenes) : [];

    const rutaDirectorio = path.join(
      process.cwd(),
      'public',
      'images',
      paquete.url,
    );

    if (!fs.existsSync(rutaDirectorio)) {
      fs.mkdirSync(rutaDirectorio, { recursive: true });
    }

    const imagenes = await Promise.all(
      archivos.map(async (archivo, index) => {
        const avifBuffer = await convertirAAvif(archivo.buffer);
        const nombreArchivo = `${Date.now()}-${archivo.originalname.replace(
          /\.\w+$/,
          '.avif',
        )}`;

        const rutaArchivo = path.join(rutaDirectorio, nombreArchivo);

        fs.writeFileSync(rutaArchivo, avifBuffer);

        const orden =
          ordenesArray[index] !== undefined ? ordenesArray[index] : index;

        const urlPublica = `/images/${paquete.url}/${nombreArchivo}`;

        return this.imagenRepo.create({
          nombre: archivo.originalname,
          mime_type: 'image/avif',
          url: urlPublica,
          orden: orden,
          paquete,
        });
      }),
    );

    return this.imagenRepo.save(imagenes);
  }

  @Patch(':url/imagenes/:id')
  updateImage(
    @Param('id') id: string,
    @Body() updateImagenDto: UpdateImagenDto,
  ) {
    return this.paquetesService.updateImage(+id, updateImagenDto);
  }

  @Delete(':url/imagenes/:id')
  removeImage(@Param('id') id: string) {
    return this.paquetesService.removeImage(+id);
  }
}
