import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, DeepPartial, In } from 'typeorm';
import { isUUID } from 'class-validator';
import { Paquete } from './entidades/paquete.entity';
import { Imagen } from '../imagen/entidades/imagen.entity';
import { Hotel } from './entidades/hotel.entity';
import { CreatePaqueteDto } from './dto/paquete/create-paquete.dto';
import { UpdatePaqueteDto } from './dto/paquete/update-paquete.dto';
import { generarCodigoUnico } from '../utils/generar-url.util';
import { Vuelo } from '../vuelos/entidades/vuelo.entity';
import { generarExcelDePaquete } from '../utils/plantilla-excel';

@Injectable()
export class PaquetesService {
  constructor(
    @InjectRepository(Paquete)
    private readonly paqueteRepository: Repository<Paquete>,
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
    @InjectRepository(Imagen)
    private readonly imagenRepository: Repository<Imagen>,
    @InjectRepository(Vuelo)
    private readonly vueloRepository: Repository<Vuelo>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createPaqueteDto: CreatePaqueteDto): Promise<Paquete> {
    const {
      imageIds,
      hotel: hotelDto,
      itinerario,
      id_vuelo,
      ...paqueteDetails
    } = createPaqueteDto;

    let hotel: Hotel | null = null;
    if (hotelDto.placeId) {
      hotel = await this.hotelRepository.findOne({
        where: { placeId: hotelDto.placeId },
      });
    }

    if (!hotel) {
      const hotelImagenes = await this.procesarIdentificadoresDeImagen(
        hotelDto?.imageIds,
      );
      hotel = this.hotelRepository.create({
        ...hotelDto,
        imagenes: hotelImagenes,
      });
    } else {
      Object.assign(hotel, hotelDto);
      if (hotelDto.imageIds) {
        hotel.imagenes = await this.procesarIdentificadoresDeImagen(
          hotelDto.imageIds,
        );
      }
    }

    const paqueteImagenes =
      await this.procesarIdentificadoresDeImagen(imageIds);

    const nuevoPaquete = this.paqueteRepository.create({
      ...paqueteDetails,
      url: await this.generarUrlUnica(),
      itinerario,
      imagenes: paqueteImagenes,
      hotel,
    });

    if (id_vuelo) {
      const vuelo = await this.vueloRepository.findOne({
        where: { id: id_vuelo },
      });
      if (!vuelo)
        throw new NotFoundException(`Vuelo con ID "${id_vuelo}" no encontrado`);
      nuevoPaquete.vuelo = vuelo;
    }

    try {
      const paqueteGuardado = await this.paqueteRepository.save(nuevoPaquete);
      return this.findOneById(paqueteGuardado.id);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new InternalServerErrorException(
          `Error de duplicado al guardar el paquete. Es posible que el 'placeId' del hotel ya exista. Detalle: ${error.message}`,
        );
      }
      throw new InternalServerErrorException(
        `Error al crear el paquete: ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    updatePaqueteDto: UpdatePaqueteDto,
  ): Promise<Paquete> {
    const paquete = await this.findOneById(id);
    const {
      imageIds,
      hotel: hotelDto,
      itinerario,
      id_vuelo,
      ...paqueteDetails
    } = updatePaqueteDto;

    Object.assign(paquete, paqueteDetails);
    if (itinerario) paquete.itinerario = itinerario as any;

    if (imageIds) {
      paquete.imagenes = await this.procesarIdentificadoresDeImagen(imageIds);
    }

    if (hotelDto) {
      Object.assign(paquete.hotel, hotelDto);
      if (hotelDto.imageIds) {
        paquete.hotel.imagenes = await this.procesarIdentificadoresDeImagen(
          hotelDto.imageIds,
        );
      }
    }

    if (id_vuelo) {
      const vuelo = await this.vueloRepository.findOne({
        where: { id: id_vuelo },
      });
      if (!vuelo)
        throw new NotFoundException(`Vuelo con ID "${id_vuelo}" no encontrado`);
      paquete.vuelo = vuelo;
    }

    try {
      await this.paqueteRepository.save(paquete);
      return this.findOneById(id);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al actualizar el paquete: ${error.message}`,
      );
    }
  }

  private async procesarIdentificadoresDeImagen(
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
      });
      imagenesFinales.push(...imagenesExistentes);
    }

    for (const url of urlsExternas) {
      let imagen = await this.imagenRepository.findOne({ where: { url } });
      if (!imagen) {
        imagen = this.imagenRepository.create({ url, es_externa: true });
      }
      imagenesFinales.push(imagen);
    }

    return imagenesFinales;
  }

  findAll(): Promise<Paquete[]> {
    return this.paqueteRepository.find({
      where: { borrado: false },
      relations: [
        'itinerario',
        'imagenes',
        'hotel',
        'hotel.imagenes',
        'vuelo',
        'vuelo.imagenes',
      ],
    });
  }

  async findOneById(id: string): Promise<Paquete> {
    const paquete = await this.paqueteRepository.findOne({
      where: { id, borrado: false },
      relations: [
        'itinerario',
        'imagenes',
        'hotel',
        'hotel.imagenes',
        'vuelo',
        'vuelo.imagenes',
      ],
    });
    if (!paquete) {
      throw new NotFoundException(`Paquete con ID "${id}" no encontrado`);
    }
    return paquete;
  }

  async findOneByUrl(url: string): Promise<Paquete> {
    const paquete = await this.paqueteRepository.findOne({
      where: { url, borrado: false },
      relations: [
        'itinerario',
        'imagenes',
        'hotel',
        'hotel.imagenes',
        'vuelo',
        'vuelo.imagenes',
      ],
    });
    if (!paquete) {
      throw new NotFoundException(`Paquete con URL "${url}" no encontrado`);
    }
    return paquete;
  }
  private async generarUrlUnica(): Promise<string> {
    let intento = 0;
    let url = '';
    let existe: Paquete | null = null;

    do {
      url = generarCodigoUnico(5);
      existe = await this.paqueteRepository.findOne({ where: { url } });
      intento++;
    } while (existe && intento < 10);

    if (existe) {
      throw new InternalServerErrorException(
        'No se pudo generar una URL única después de varios intentos.',
      );
    }
    return url;
  }
  async remove(id: string): Promise<{ message: string }> {
    const paquete = await this.findOneById(id);
    paquete.borrado = true;
    await this.paqueteRepository.save(paquete);
    return {
      message: `Paquete con ID "${id}" ha sido marcado como eliminado.`,
    };
  }

  async exportToExcel(id: string): Promise<Buffer> {
    const paquete = await this.findOneById(id);
    if (!paquete) {
      throw new NotFoundException(`Paquete con ID "${id}" no encontrado`);
    }

    return generarExcelDePaquete(paquete);
  }
}
