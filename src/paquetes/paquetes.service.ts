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
import * as ExcelJS from 'exceljs';

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
        this.imagenRepository.create({ url: imgDto.url, orden: imgDto.orden }),
      ),
      hotel: this.hotelRepository.create({
        placeId: hotel.id,
        nombre: hotel.nombre,
        estrellas: hotel.estrellas,
        isCustom: hotel.isCustom,
        total_calificaciones: hotel.total_calificaciones,
        imagenes:
          hotel.images?.map((imgDto) =>
            this.imagenRepository.create({
              url: imgDto.url,
              orden: imgDto.orden,
            }),
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
      where: { borrado: false }, 
      relations: ['itinerario', 'imagenes', 'hotel', 'hotel.imagenes'],
    });
  }


  async findOneById(id: string): Promise<Paquete> {
    const paquete = await this.paqueteRepository.findOne({
      where: { id, borrado: false },
      relations: ['itinerario', 'imagenes', 'hotel', 'hotel.imagenes'],
    });
    if (!paquete) {
      throw new NotFoundException(`Paquete con ID "${id}" no encontrado`);
    }
    return paquete;
  }


  async findOneByUrl(url: string): Promise<Paquete> {
    const paquete = await this.paqueteRepository.findOne({
      where: { url, borrado: false }, 
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
        await queryRunner.manager.delete(Imagen, {
          hotel: { id: paquete.hotel.id },
        });
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
          this.imagenRepository.create({
            url: imgDto.url,
            orden: imgDto.orden,
          }),
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
              this.imagenRepository.create({
                url: imgDto.url,
                orden: imgDto.orden,
              }),
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
    paquete.borrado = true;
    await this.paqueteRepository.save(paquete);
    return {
      message: `Paquete con ID "${id}" ha sido marcado como eliminado.`,
    };
  }



   async exportToExcel(id: string): Promise<Buffer> {
    const paquete = await this.findOneById(id);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Paquete');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Nombre del Paquete', key: 'nombre_paquete', width: 30 },
      { header: 'Duración (días)', key: 'duracion', width: 15 },
      { header: 'Origen', key: 'origen', width: 20 },
      { header: 'Destino', key: 'destino', width: 20 },
      { header: 'Precio Base', key: 'precio_base', width: 15 },
      { header: 'Descuento', key: 'descuento', width: 15 },
      { header: 'Fecha de Caducidad', key: 'fecha_caducidad', width: 20 },
    ];

    worksheet.addRow({
      id: paquete.id,
      nombre_paquete: paquete.nombre_paquete,
      duracion: paquete.duracion,
      origen: paquete.origen,
      destino: paquete.destino,
      precio_base: paquete.precio_base,
      descuento: paquete.descuento,
      fecha_caducidad: paquete.fecha_caducidad,
    });

    // Agregando itinerario
    worksheet.addRow({}); // Fila vacía para separar
    worksheet.addRow(['Día', 'Descripción del Itinerario']);
    paquete.itinerario.forEach(item => {
      worksheet.addRow([item.dia, item.descripcion]);
    });


    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as Buffer;
  }
}