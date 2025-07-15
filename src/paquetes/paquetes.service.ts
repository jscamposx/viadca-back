import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, DeepPartial, In } from 'typeorm';
import { Paquete } from './entidades/paquete.entity';
import { Imagen } from '../imagen/entidades/imagen.entity'; // Asegúrate que la ruta sea correcta
import { Hotel } from './entidades/hotel.entity';
import { CreatePaqueteDto } from './dto/paquete/create-paquete.dto';
import { UpdatePaqueteDto } from './dto/paquete/update-paquete.dto';
import { generarCodigoUnico } from '../utils/generar-url.util';
import { Vuelo } from './entidades/vuelo.entity';
import * as ExcelJS from 'exceljs';

@Injectable()
export class PaquetesService {
  constructor(
    @InjectRepository(Paquete)
    private readonly paqueteRepository: Repository<Paquete>,
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
    @InjectRepository(Imagen)
    private readonly imagenRepository: Repository<Imagen>, // Correctamente inyectado
    @InjectRepository(Vuelo)
    private readonly vueloRepository: Repository<Vuelo>,
    private readonly dataSource: DataSource,
  ) {}

  // --- El método create que ya habías ajustado ---
  async create(createPaqueteDto: CreatePaqueteDto): Promise<Paquete> {
    const { imageIds, hotel: hotelDto, itinerario, id_vuelo, ...paqueteDetails } = createPaqueteDto;
    const url = await this.generarUrlUnica();

    const imagenes = await this.imagenRepository.findBy({ id: In(imageIds || []) });
    if (imageIds && imagenes.length !== imageIds.length) {
      throw new NotFoundException('Una o más imágenes del paquete no fueron encontradas.');
    }

    const hotelImages = hotelDto.imageIds ? await this.imagenRepository.findBy({ id: In(hotelDto.imageIds) }) : [];
    if (hotelDto.imageIds && hotelImages.length !== hotelDto.imageIds.length) {
        throw new NotFoundException('Una o más imágenes del hotel no fueron encontradas.');
    }

    const paqueteData: DeepPartial<Paquete> = {
      ...paqueteDetails,
      url,
      itinerario,
      imagenes: imagenes,
      hotel: this.hotelRepository.create({
        placeId: hotelDto.id,
        nombre: hotelDto.nombre,
        estrellas: hotelDto.estrellas,
        isCustom: hotelDto.isCustom,
        total_calificaciones: hotelDto.total_calificaciones,
        imagenes: hotelImages,
      }),
    };

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
      return this.findOneById(paquete.id);
    } catch (error) {
      throw new InternalServerErrorException(`Error al crear el paquete: ${error.message}`);
    }
  }

  // --- El método update refactorizado ---
  async update(id: string, updatePaqueteDto: UpdatePaqueteDto): Promise<Paquete> {
    const { imageIds, hotel: hotelDto, itinerario, id_vuelo, ...paqueteDetails } = updatePaqueteDto;

    const paquete = await this.paqueteRepository.findOne({
      where: { id },
      relations: ['hotel', 'hotel.imagenes', 'imagenes'],
    });

    if (!paquete) {
      throw new NotFoundException(`Paquete con ID "${id}" no encontrado para actualizar`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Actualizar imágenes del paquete
      if (imageIds) {
        const imagenes = await this.imagenRepository.findBy({ id: In(imageIds) });
        if (imagenes.length !== imageIds.length) {
          throw new NotFoundException('Una o más imágenes del paquete no fueron encontradas.');
        }
        paquete.imagenes = imagenes;
      }

      // Actualizar hotel y sus imágenes
      if (hotelDto) {
        const hotelImages = hotelDto.imageIds ? await this.imagenRepository.findBy({ id: In(hotelDto.imageIds) }) : [];
         if (hotelDto.imageIds && hotelImages.length !== hotelDto.imageIds.length) {
          throw new NotFoundException('Una o más imágenes del hotel no fueron encontradas.');
        }

        if (paquete.hotel) {
            Object.assign(paquete.hotel, {
                placeId: hotelDto.id,
                nombre: hotelDto.nombre,
                estrellas: hotelDto.estrellas,
                isCustom: hotelDto.isCustom,
                total_calificaciones: hotelDto.total_calificaciones,
                imagenes: hotelImages,
            });
        }
      }
      
      // Actualizar vuelo
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
      
      // Actualizar el resto de los detalles
      Object.assign(paquete, paqueteDetails);
      if (itinerario) {
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

  // --- El resto de tus métodos (findAll, findOneById, etc.) ---
  // ... (No necesitan cambios)

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

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Paquete');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Nombre del Paquete', key: 'nombre_paquete', width: 30 },
      { header: 'Duración (días)', key: 'duracion', width: 15 },
      { header: 'Origen', key: 'origen', width: 20 },
      { header: 'Destino', key: 'destino', width: 20 },
      {
        header: 'Precio Base',
        key: 'precio_base',
        width: 15,
        style: { numFmt: '"$"#,##0.00' },
      },
      { header: 'Hotel', key: 'hotel', width: 30 },
      { header: 'Vuelo', key: 'vuelo', width: 30 },
    ];

    worksheet.addRow({
      id: paquete.id,
      nombre_paquete: paquete.nombre_paquete,
      duracion: paquete.duracion,
      origen: paquete.origen,
      destino: paquete.destino,
      precio_base: paquete.precio_base,
      hotel: paquete.hotel ? paquete.hotel.nombre : 'N/A',
      vuelo: paquete.vuelo ? paquete.vuelo.nombre : 'N/A',
    });

    if (paquete.itinerario && paquete.itinerario.length > 0) {
      worksheet.addRow([]);
      const itinerarioHeader = worksheet.addRow(['Itinerario']);
      itinerarioHeader.font = { bold: true };
      worksheet.addRow(['Día', 'Descripción']);
      paquete.itinerario.forEach((item) => {
        worksheet.addRow([item.dia, item.descripcion]);
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as Buffer;
  }
}