import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Paquete } from './entidades/paquete.entity';
import { CreatePaqueteDto } from './dto/paquete/create-paquete.dto';
import { UpdatePaqueteDto } from './dto/paquete/update-paquete.dto';
import { generarCodigoUnico } from '../utils/generar-url.util';
import { Vuelo } from '../vuelos/entidades/vuelo.entity';
import { generarExcelDePaquete } from '../utils/plantilla-excel';
import { HotelesService } from '../hoteles/hoteles.service';
import { Itinerario } from './entidades/itinerario.entity';
import { ImagenService } from '../imagen/imagen.service';

@Injectable()
export class PaquetesService {
  constructor(
    @InjectRepository(Paquete)
    private readonly paqueteRepository: Repository<Paquete>,
    @InjectRepository(Vuelo)
    private readonly vueloRepository: Repository<Vuelo>,
    @InjectRepository(Itinerario)
    private readonly itinerarioRepository: Repository<Itinerario>,
    private readonly hotelesService: HotelesService,
    private readonly imagenService: ImagenService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createPaqueteDto: CreatePaqueteDto): Promise<Paquete> {
    const {
      imageIds,
      hotel: hotelDto,
      itinerario: itinerarioDto,
      id_vuelo,
      ...paqueteDetails
    } = createPaqueteDto;

    const hotel = await this.hotelesService.create(hotelDto);

    const paqueteImagenes =
      await this.imagenService.procesarIdentificadoresDeImagen(imageIds);

    const itinerario = itinerarioDto.map((dto) =>
      this.itinerarioRepository.create(dto),
    );

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
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `Error al crear el paquete: ${message}`,
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
      itinerario: itinerarioDto,
      id_vuelo,
      ...paqueteDetails
    } = updatePaqueteDto;

    Object.assign(paquete, paqueteDetails);

    if (itinerarioDto) {
      if (paquete.itinerario && paquete.itinerario.length > 0) {
        await this.itinerarioRepository.remove(paquete.itinerario);
      }
      paquete.itinerario = itinerarioDto.map((dto) =>
        this.itinerarioRepository.create(dto),
      );
    }

    if (imageIds) {
      paquete.imagenes =
        await this.imagenService.procesarIdentificadoresDeImagen(imageIds);
    }

    if (hotelDto) {
      paquete.hotel = await this.hotelesService.update(
        paquete.hotel.id,
        hotelDto,
      );
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
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `Error al actualizar el paquete: ${message}`,
      );
    }
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
