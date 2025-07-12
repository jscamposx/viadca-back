import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Paquete } from './entidades/paquete.entity';
import { Imagen } from './entidades/imagen.entity';
import { Hotel } from './entidades/hotel.entity';
import { CreatePaqueteDto } from './dto/paquete/create-paquete.dto';
import { UpdatePaqueteDto } from './dto/paquete/update-paquete.dto';
import { generarCodigoUnico } from '../utils/generar-url.util';

@Injectable()
export class PaquetesService {
  constructor(
    @InjectRepository(Paquete)
    private readonly paqueteRepository: Repository<Paquete>,
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
    @InjectRepository(Imagen)
    private readonly imagenRepository: Repository<Imagen>,
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
    const { images, hotel, itinerario, ...paqueteDetails } = createPaqueteDto;
    const url = await this.generarUrlUnica();

    const paquete = this.paqueteRepository.create({
      ...paqueteDetails,
      url,
      itinerario: itinerario,
      imagenes: images.map((imgDto) =>
        this.imagenRepository.create({ url: imgDto.url }),
      ),
      hotel: this.hotelRepository.create({
        placeId: hotel.id,
        nombre: hotel.nombre,
        estrellas: hotel.estrellas,
        isCustom: hotel.isCustom,
        total_calificaciones: hotel.total_calificaciones,
        imagenes:
          hotel.images?.map((imgDto) =>
            this.imagenRepository.create({ url: imgDto.url }),
          ) || [],
      }),
    });

    try {
      await this.paqueteRepository.save(paquete);
      return paquete;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear el paquete: ${error.message}`,
      );
    }
  }

  findAll(): Promise<Paquete[]> {
    return this.paqueteRepository.find({
      relations: ['itinerario', 'imagenes', 'hotel', 'hotel.imagenes'],
    });
  }

  async findOneById(id: string): Promise<Paquete> {
    const paquete = await this.paqueteRepository.findOne({
      where: { id },
      relations: ['itinerario', 'imagenes', 'hotel', 'hotel.imagenes'],
    });
    if (!paquete) {
      throw new NotFoundException(`Paquete con ID "${id}" no encontrado`);
    }
    return paquete;
  }

  async findOneByUrl(url: string): Promise<Paquete> {
    const paquete = await this.paqueteRepository.findOne({
      where: { url },
      relations: ['itinerario', 'imagenes', 'hotel', 'hotel.imagenes'],
    });
    if (!paquete) {
      throw new NotFoundException(`Paquete con URL "${url}" no encontrado`);
    }
    return paquete;
  }

  async update(
    id: string,
    updatePaqueteDto: UpdatePaqueteDto,
  ): Promise<Paquete> {
    const { images, hotel, itinerario, ...paqueteDetails } = updatePaqueteDto;

    const paquete = await this.paqueteRepository.findOne({
      where: { id },
      relations: ['hotel', 'imagenes'],
    });

    if (!paquete) {
      throw new NotFoundException(
        `Paquete con ID "${id}" no encontrado para actualizar`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(Imagen, { paquete: { id } });
      }
      if (hotel && paquete.hotel) {
        await queryRunner.manager.delete(Hotel, { id: paquete.hotel.id });
      }

      const updatedPaquete = this.paqueteRepository.merge(
        paquete,
        paqueteDetails,
      );
      if (itinerario) {
        updatedPaquete.itinerario = itinerario as any;
      }

      if (images) {
        updatedPaquete.imagenes = images.map((imgDto) =>
          this.imagenRepository.create({ url: imgDto.url }),
        );
      }
      if (hotel) {
        updatedPaquete.hotel = this.hotelRepository.create({
          placeId: hotel.id,
          nombre: hotel.nombre,
          estrellas: hotel.estrellas,
          isCustom: hotel.isCustom,
          total_calificaciones: hotel.total_calificaciones,
          imagenes:
            hotel.images?.map((imgDto) =>
              this.imagenRepository.create({ url: imgDto.url }),
            ) || [],
        });
      }

      await queryRunner.manager.save(updatedPaquete);

      await queryRunner.commitTransaction();
      return this.findOneById(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `Error al actualizar el paquete: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const paquete = await this.findOneById(id);
    await this.paqueteRepository.remove(paquete);
    return {
      message: `Paquete con ID "${id}" y sus datos asociados han sido eliminados.`,
    };
  }
}
