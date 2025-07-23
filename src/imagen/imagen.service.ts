import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Imagen } from './entidades/imagen.entity';
import { CreateImagenDto } from './dto/create-imagen.dto';
import { Paquete } from '../paquetes/entidades/paquete.entity';
import { Hotel } from '../hoteles/entidades/hotel.entity';
import { Vuelo } from '../vuelos/entidades/vuelo.entity';
import { ImageHandlerService } from './image-handler.service';
import { isUUID } from 'class-validator';

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

  async create(createImagenDto: CreateImagenDto): Promise<Imagen> {
    const { image, url, paqueteId, hotelId, vueloId, orden } = createImagenDto;
    const nuevaImagen = new Imagen();

    if (orden !== undefined) {
      nuevaImagen.orden = orden;
    }

    if (url) {
      nuevaImagen.url = url;
      nuevaImagen.es_externa = true;
    } else if (image) {
      try {
        const processedImage =
          await this.imageHandlerService.saveImageFromBase64(image);
        nuevaImagen.url = processedImage.url;
        nuevaImagen.es_externa = false;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new InternalServerErrorException(
          `Error al procesar la imagen Base64: ${message}`,
        );
      }
    }

    if (paqueteId) {
      const paquete = await this.paqueteRepository.findOne({
        where: { id: paqueteId, borrado: false },
      });
      if (!paquete) {
        throw new NotFoundException(
          `Paquete con ID "${paqueteId}" no encontrado`,
        );
      }
      nuevaImagen.paquete = paquete;
    }

    if (hotelId) {
      const hotel = await this.hotelRepository.findOne({
        where: { id: hotelId, borrado: false },
      });
      if (!hotel) {
        throw new NotFoundException(`Hotel con ID "${hotelId}" no encontrado`);
      }
      nuevaImagen.hotel = hotel;
    }

    if (vueloId) {
      const vuelo = await this.vueloRepository.findOne({
        where: { id: vueloId, borrado: false },
      });
      if (!vuelo) {
        throw new NotFoundException(`Vuelo con ID "${vueloId}" no encontrado`);
      }
      nuevaImagen.vuelo = vuelo;
    }

    return this.imagenRepository.save(nuevaImagen);
  }

  findAll(): Promise<Imagen[]> {
    return this.imagenRepository.find({
      where: { borrado: false },
      relations: ['paquete', 'hotel', 'vuelo'],
    });
  }

  async findOne(id: string): Promise<Imagen> {
    const imagen = await this.imagenRepository.findOne({
      where: { id, borrado: false },
    });
    if (!imagen) {
      throw new NotFoundException(`Imagen con ID "${id}" no encontrada`);
    }
    return imagen;
  }

  async remove(id: string): Promise<{ message: string }> {
    const imagen = await this.findOne(id);

    imagen.borrado = true;
    await this.imagenRepository.save(imagen);

    return { message: `Imagen con ID "${id}" ha sido marcada como eliminada.` };
  }

  async procesarIdentificadoresDeImagen(
    identificadores: string[] | undefined,
  ): Promise<Imagen[]> {
    if (!identificadores || identificadores.length === 0) {
      return [];
    }

    const imagenesFinales: Imagen[] = [];
    const uuids = identificadores.filter((id) => isUUID(id));
    const urlsExternas = identificadores.filter((id) => id.startsWith('http'));

    if (uuids.length > 0) {
      const imagenesExistentes = await this.imagenRepository.findBy({
        id: In(uuids),
        borrado: false,
      });
      imagenesFinales.push(...imagenesExistentes);
    }

    for (const url of urlsExternas) {
      let imagen = await this.imagenRepository.findOne({
        where: { url, borrado: false },
      });
      if (!imagen) {
        imagen = this.imagenRepository.create({ url, es_externa: true });
      }
      imagenesFinales.push(imagen);
    }

    return imagenesFinales;
  }
}
