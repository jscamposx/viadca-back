import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Paquete } from './entidades/paquete.entity';
import { Imagen } from './entidades/imagen.entity';
import { Hotel } from './entidades/hotel.entity';
import { CreatePaqueteDto } from './dto/paquete/create-paquete.dto';
import { UpdatePaqueteDto } from './dto/paquete/update-paquete.dto';
import { generarCodigoUnico } from '../utils/generar-url.util'; // Asumo que este util existe

@Injectable()
export class PaquetesService {
  constructor(
    @InjectRepository(Paquete)
    private readonly paqueteRepository: Repository<Paquete>,
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
    @InjectRepository(Imagen)
    private readonly imagenRepository: Repository<Imagen>,
    private readonly dataSource: DataSource, // Inyectamos DataSource para transacciones
  ) {}

  /**
   * Genera una URL única para un nuevo paquete.
   */
  private async generarUrlUnica(): Promise<string> {
    let intento = 0;
    let url = '';
    let existe: Paquete | null = null;

    do {
      url = generarCodigoUnico(5); // Genera un código de 5 caracteres
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

  /**
   * Crea un nuevo paquete con su hotel e imágenes asociadas.
   * Utiliza una transacción para garantizar la integridad de los datos.
   */
  async create(createPaqueteDto: CreatePaqueteDto): Promise<Paquete> {
    const { imagenes, hotel, itinerario, ...paqueteDetails } = createPaqueteDto;
    const url = await this.generarUrlUnica();

    const paquete = this.paqueteRepository.create({
      ...paqueteDetails,
      url,
      itinerario: itinerario, // Asume que el DTO y la entidad coinciden
      imagenes: imagenes.map(imgDto => this.imagenRepository.create({ url: imgDto.url })),
      hotel: this.hotelRepository.create({
        placeId: hotel.id,
        nombre: hotel.nombre,
        estrellas: hotel.estrellas,
        isCustom: hotel.isCustom,
        total_calificaciones: hotel.total_calificaciones,
        imagenes: hotel.images?.map(imgDto =>
          this.imagenRepository.create({ url: imgDto.url }),
        ) || [],
      }),
    });

    try {
      await this.paqueteRepository.save(paquete);
      return paquete;
    } catch (error) {
      // Aquí puedes manejar errores específicos de la base de datos
      throw new InternalServerErrorException(`Error al crear el paquete: ${error.message}`);
    }
  }

  /**
   * Encuentra todos los paquetes con sus relaciones principales.
   */
  findAll(): Promise<Paquete[]> {
    // Eager loading en las entidades ya carga las relaciones,
    // pero podemos ser explícitos si es necesario.
    return this.paqueteRepository.find({
      relations: ['itinerario', 'imagenes', 'hotel', 'hotel.imagenes'],
    });
  }

  /**
   * Encuentra un paquete por su ID (UUID).
   */
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

  /**
   * Encuentra un paquete por su URL única.
   */
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

  /**
   * Actualiza un paquete. Reemplaza las imágenes y el hotel existentes.
   */
  async update(id: string, updatePaqueteDto: UpdatePaqueteDto): Promise<Paquete> {
    const { imagenes, hotel, itinerario, ...paqueteDetails } = updatePaqueteDto;

    const paquete = await this.paqueteRepository.findOne({
        where: { id },
        relations: ['hotel', 'imagenes'] // Cargar relaciones a modificar
    });

    if (!paquete) {
      throw new NotFoundException(`Paquete con ID "${id}" no encontrado para actualizar`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Borrar relaciones antiguas si se proporcionan nuevas en el DTO
      if (imagenes) {
        await queryRunner.manager.delete(Imagen, { paquete: { id } });
      }
      if (hotel && paquete.hotel) {
        await queryRunner.manager.delete(Hotel, { id: paquete.hotel.id });
      }

      // 2. Mapear DTO a la entidad a actualizar
      const updatedPaquete = this.paqueteRepository.merge(paquete, paqueteDetails);
      if (itinerario) {
        // La actualización de itinerarios puede requerir su propia lógica
        updatedPaquete.itinerario = itinerario as any;
      }

      // 3. Crear y asignar nuevas relaciones solo si existen en el DTO
      if (imagenes) {
        updatedPaquete.imagenes = imagenes.map(imgDto => this.imagenRepository.create({ url: imgDto.url }));
      }
      if (hotel) {
        updatedPaquete.hotel = this.hotelRepository.create({
          placeId: hotel.id,
          nombre: hotel.nombre,
          estrellas: hotel.estrellas,
          isCustom: hotel.isCustom,
          total_calificaciones: hotel.total_calificaciones,
          imagenes: hotel.images?.map(imgDto => this.imagenRepository.create({ url: imgDto.url })) || [],
        });
      }

      // 4. Guardar todo en la transacción
      await queryRunner.manager.save(updatedPaquete);

      await queryRunner.commitTransaction();
      return this.findOneById(id); // Devolver la entidad actualizada con todas las relaciones

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(`Error al actualizar el paquete: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Elimina un paquete por su ID. La base de datos se encarga de borrar
   * en cascada las relaciones (hotel, imágenes, itinerario).
   */
  async remove(id: string): Promise<{ message: string }> {
    const paquete = await this.findOneById(id); // findOneById ya lanza NotFoundException si no existe
    
    // NOTA: La lógica de borrar archivos del sistema de archivos (fs) se elimina,
    // ya que ahora las URLs pueden apuntar a cualquier lugar (ej. un bucket S3).
    // Si necesitas borrar archivos locales, esa lógica debería ir aquí.

    await this.paqueteRepository.remove(paquete);
    return { message: `Paquete con ID "${id}" y sus datos asociados han sido eliminados.` };
  }
}
