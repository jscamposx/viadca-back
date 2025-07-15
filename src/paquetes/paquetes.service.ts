import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, DeepPartial } from 'typeorm'; // Importar DeepPartial
import { Paquete } from './entidades/paquete.entity';
import { Imagen } from './entidades/imagen.entity';
import { Hotel } from './entidades/hotel.entity';
import { CreatePaqueteDto } from './dto/paquete/create-paquete.dto';
import { UpdatePaqueteDto } from './dto/paquete/update-paquete.dto';
import { generarCodigoUnico } from '../utils/generar-url.util';
import { Vuelo } from './entidades/vuelo.entity';

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

  async create(createPaqueteDto: CreatePaqueteDto): Promise<Paquete> {
    const { images, hotel, itinerario, id_vuelo, ...paqueteDetails } = createPaqueteDto;
    const url = await this.generarUrlUnica();

    // Se crea un objeto base para el paquete
    const paqueteData: DeepPartial<Paquete> = {
      ...paqueteDetails,
      url,
      itinerario,
      imagenes: images.map((imgDto) => this.imagenRepository.create(imgDto)),
      hotel: this.hotelRepository.create({
        placeId: hotel.id,
        nombre: hotel.nombre,
        estrellas: hotel.estrellas,
        isCustom: hotel.isCustom,
        total_calificaciones: hotel.total_calificaciones,
        imagenes: hotel.images?.map((imgDto) => this.imagenRepository.create(imgDto)) || [],
      }),
    };

    // Si se proporciona un id_vuelo, se busca y se asigna al paquete
    if (id_vuelo) {
      const vuelo = await this.vueloRepository.findOne({ where: { id: id_vuelo } });
      if (!vuelo) {
        throw new NotFoundException(`Vuelo con ID "${id_vuelo}" no encontrado`);
      }
      paqueteData.vuelo = vuelo;
    }

    const paquete = this.paqueteRepository.create(paqueteData);

    try {
      await this.paqueteRepository.save(paquete);
      return paquete;
    } catch (error) {
      throw new InternalServerErrorException(`Error al crear el paquete: ${error.message}`);
    }
  }

  findAll(): Promise<Paquete[]> {
    return this.paqueteRepository.find({
      where: { borrado: false },
      relations: ['itinerario', 'imagenes', 'hotel', 'hotel.imagenes', 'vuelo', 'vuelo.imagenes'],
    });
  }

  async findOneById(id: string): Promise<Paquete> {
    const paquete = await this.paqueteRepository.findOne({
      where: { id, borrado: false },
      relations: ['itinerario', 'imagenes', 'hotel', 'hotel.imagenes', 'vuelo', 'vuelo.imagenes'],
    });
    if (!paquete) {
      throw new NotFoundException(`Paquete con ID "${id}" no encontrado`);
    }
    return paquete;
  }

  async findOneByUrl(url: string): Promise<Paquete> {
    const paquete = await this.paqueteRepository.findOne({
      where: { url, borrado: false },
      relations: ['itinerario', 'imagenes', 'hotel', 'hotel.imagenes', 'vuelo', 'vuelo.imagenes'],
    });
    if (!paquete) {
      throw new NotFoundException(`Paquete con URL "${url}" no encontrado`);
    }
    return paquete;
  }

  async update(id: string, updatePaqueteDto: UpdatePaqueteDto): Promise<Paquete> {
    const { images, hotel, itinerario, id_vuelo, ...paqueteDetails } = updatePaqueteDto;
    
    // Usamos preload para cargar la entidad y aplicar los cambios del DTO
    const paquete = await this.paqueteRepository.preload({
        id: id,
        ...paqueteDetails
    });

    if (!paquete) {
      throw new NotFoundException(`Paquete con ID "${id}" no encontrado para actualizar`);
    }

    // Si se proporciona un id_vuelo, se busca y se asigna al paquete
    if (id_vuelo !== undefined) {
        if (id_vuelo === null) {
            paquete.vuelo = undefined;
        } else {
            const vuelo = await this.vueloRepository.findOne({ where: { id: id_vuelo } });
            if (!vuelo) {
                throw new NotFoundException(`Vuelo con ID "${id_vuelo}" no encontrado`);
            }
            paquete.vuelo = vuelo;
        }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(Imagen, { paquete: { id } });
        paquete.imagenes = images.map((imgDto) => this.imagenRepository.create(imgDto));
      }

      if (hotel) {
        if (paquete.hotel) {
            await queryRunner.manager.delete(Imagen, { hotel: { id: paquete.hotel.id } });
            await queryRunner.manager.delete(Hotel, { id: paquete.hotel.id });
        }
        paquete.hotel = this.hotelRepository.create({
          placeId: hotel.id,
          nombre: hotel.nombre,
          estrellas: hotel.estrellas,
          isCustom: hotel.isCustom,
          total_calificaciones: hotel.total_calificaciones,
          imagenes: hotel.images?.map((imgDto) => this.imagenRepository.create(imgDto)) || [],
        });
      }

      if (itinerario) {
        // Aquí deberías manejar la lógica para actualizar o reemplazar el itinerario
        paquete.itinerario = itinerario as any;
      }

      await queryRunner.manager.save(paquete);
      await queryRunner.commitTransaction();
      
      return this.findOneById(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(`Error al actualizar el paquete: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const paquete = await this.findOneById(id);
    paquete.borrado = true;
    await this.paqueteRepository.save(paquete);
    return {
      message: `Paquete con ID "${id}" ha sido marcado como eliminado.`,
    };
  }
}