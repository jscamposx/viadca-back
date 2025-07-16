// src/imagen/imagen.service.ts

import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Imagen } from './entidades/imagen.entity';
import { CreateImagenDto } from './dto/create-imagen.dto';
import { Paquete } from '../paquetes/entidades/paquete.entity';
import { Hotel } from '../paquetes/entidades/hotel.entity';
import { Vuelo } from '../paquetes/entidades/vuelo.entity';
import { ImageHandlerService } from '../utils/image-handler.service';

@Injectable()
export class ImagenService {
  constructor(
    @InjectRepository(Imagen)
    private readonly imagenRepository: Repository<Imagen>,
    @InjectRepository(Paquete)
    private readonly paqueteRepository: Repository<Paquete>,
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
    @InjectRepository(Vuelo)
    private readonly vueloRepository: Repository<Vuelo>,
    private readonly imageHandlerService: ImageHandlerService,
  ) {}

  /**
   * Método unificado para crear una imagen desde Base64 o URL.
   */
  async create(createImagenDto: CreateImagenDto): Promise<Imagen> {
    const { image, url, paqueteId, hotelId, vueloId } = createImagenDto;
    const nuevaImagen = new Imagen();

    if (url) {
      // Si es una URL, la guardamos directamente
      nuevaImagen.url = url;
      nuevaImagen.es_externa = true;
    } else if (image) {
      // Si es Base64, la procesamos para guardarla localmente
      try {
        const processedImage =
          await this.imageHandlerService.saveImageFromBase64(image);
        nuevaImagen.url = processedImage.url;
        nuevaImagen.es_externa = false;
      } catch (error) {
        throw new InternalServerErrorException(
          `Error al procesar la imagen Base64: ${error.message}`,
        );
      }
    }

    // Lógica para asociar la imagen a otras entidades
    if (paqueteId) {
      const paquete = await this.paqueteRepository.findOne({
        where: { id: paqueteId },
      });
      if (!paquete) {
        throw new NotFoundException(
          `Paquete con ID "${paqueteId}" no encontrado`,
        );
      }
      nuevaImagen.paquete = paquete;
    }

    return this.imagenRepository.save(nuevaImagen);
  }

  findAll(): Promise<Imagen[]> {
    return this.imagenRepository.find({
      relations: ['paquete', 'hotel', 'vuelo'],
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.imagenRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Imagen con ID "${id}" no encontrada`);
    }
    return { message: `Imagen con ID "${id}" ha sido eliminada.` };
  }
}
