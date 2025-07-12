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
import { ImageHandlerService } from '../utils/image-handler.service';

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
    private readonly imageHandlerService: ImageHandlerService, // Servicio inyectado
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

    // 1. Procesar y guardar imágenes del paquete
    const processedPaqueteImages = await Promise.all(
      images.map(async (imgDto) => {
        const savedImage = await this.imageHandlerService.saveImageFromUrl(
          imgDto.url,
        );
        return this.imagenRepository.create(savedImage);
      }),
    );

    // 2. Procesar y guardar imágenes del hotel (si existen)
    let processedHotelImages: Imagen[] = [];
    if (hotel.images && hotel.images.length > 0) {
      processedHotelImages = await Promise.all(
        hotel.images.map(async (imgDto) => {
          const savedImage = await this.imageHandlerService.saveImageFromUrl(
            imgDto.url,
          );
          return this.imagenRepository.create(savedImage);
        }),
      );
    }

    // 3. Crear la entidad Paquete con las imágenes procesadas
    const paquete = this.paqueteRepository.create({
      ...paqueteDetails,
      url,
      itinerario, // TypeORM se encargará de esto por la cascada
      imagenes: processedPaqueteImages,
      hotel: this.hotelRepository.create({
        placeId: hotel.id,
        nombre: hotel.nombre,
        estrellas: hotel.estrellas,
        isCustom: hotel.isCustom,
        total_calificaciones: hotel.total_calificaciones,
        imagenes: processedHotelImages,
      }),
    });

    try {
      await this.paqueteRepository.save(paquete);
      return paquete;
    } catch (error) {
      // Aquí podrías agregar lógica para eliminar las imágenes guardadas si falla la transacción
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
      relations: ['hotel', 'hotel.imagenes', 'imagenes', 'itinerario'],
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
      // Eliminar imágenes antiguas si se proporcionan nuevas
      if (images) {
        await queryRunner.manager.remove(paquete.imagenes);
        const newImages = await Promise.all(
          images.map(async (imgDto) => {
            const savedImage = await this.imageHandlerService.saveImageFromUrl(
              imgDto.url,
            );
            return this.imagenRepository.create(savedImage);
          }),
        );
        paquete.imagenes = newImages;
      }

      // Reemplazar hotel si se proporciona uno nuevo
      if (hotel) {
        if (paquete.hotel) {
          await queryRunner.manager.remove(paquete.hotel);
        }
        let hotelImages: Imagen[] = [];
        if (hotel.images && hotel.images.length > 0) {
          hotelImages = await Promise.all(
            hotel.images.map(async (imgDto) => {
              const savedImage =
                await this.imageHandlerService.saveImageFromUrl(imgDto.url);
              return this.imagenRepository.create(savedImage);
            }),
          );
        }
        paquete.hotel = this.hotelRepository.create({
          ...hotel,
          placeId: hotel.id,
          imagenes: hotelImages,
        });
      }

      // Actualizar itinerario
      if (itinerario) {
        await queryRunner.manager.remove(paquete.itinerario);
        paquete.itinerario = itinerario as any;
      }

      // Actualizar detalles del paquete
      queryRunner.manager.merge(Paquete, paquete, paqueteDetails);
      
      await queryRunner.manager.save(Paquete, paquete);

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
    // La eliminación en cascada se encargará de las entidades relacionadas
    await this.paqueteRepository.remove(paquete);
    return {
      message: `Paquete con ID "${id}" y sus datos asociados han sido eliminados.`,
    };
  }
}