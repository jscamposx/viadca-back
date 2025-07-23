import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paquete } from '../paquetes/entidades/paquete.entity';
import { Hotel } from '../hoteles/entidades/hotel.entity';
import { Vuelo } from '../vuelos/entidades/vuelo.entity';
import { ImageHandlerService } from '../imagen/image-handler.service';
import { Imagen } from '../imagen/entidades/imagen.entity';

@Injectable()
export class PapeleraService {
  constructor(
    @InjectRepository(Paquete)
    private readonly paqueteRepository: Repository<Paquete>,
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
    @InjectRepository(Vuelo)
    private readonly vueloRepository: Repository<Vuelo>,
    private readonly imageHandlerService: ImageHandlerService,
  ) {}

  async findAll() {
    const paquetes = await this.paqueteRepository.find({
      where: { borrado: true },
    });
    const hoteles = await this.hotelRepository.find({
      where: { borrado: true },
    });
    const vuelos = await this.vueloRepository.find({ where: { borrado: true } });

    return {
      paquetes,
      hoteles,
      vuelos,
    };
  }

  async restore(id: string, tipo: string) {
    let repository: Repository<any>;
    switch (tipo) {
      case 'paquete':
        repository = this.paqueteRepository;
        break;
      case 'hotel':
        repository = this.hotelRepository;
        break;
      case 'vuelo':
        repository = this.vueloRepository;
        break;
      default:
        throw new NotFoundException(`Tipo de entidad "${tipo}" no válido.`);
    }

    const item = await repository.findOne({ where: { id, borrado: true } });

    if (!item) {
      throw new NotFoundException(
        `${tipo} con ID "${id}" no encontrado en la papelera.`,
      );
    }

    item.borrado = false;
    await repository.save(item);
    return { message: `${tipo} con ID "${id}" ha sido restaurado.` };
  }

  async remove(id: string, tipo: string) {
    let repository: Repository<any>;
    let relations: string[] = [];
    switch (tipo) {
      case 'paquete':
        repository = this.paqueteRepository;
        relations = ['imagenes', 'hotel.imagenes', 'vuelo.imagenes'];
        break;
      case 'hotel':
        repository = this.hotelRepository;
        relations = ['imagenes'];
        break;
      case 'vuelo':
        repository = this.vueloRepository;
        relations = ['imagenes'];
        break;
      default:
        throw new NotFoundException(`Tipo de entidad "${tipo}" no válido.`);
    }

    const item = await repository.findOne({ where: { id }, relations });

    if (item) {
      const imagenesABorrar: Imagen[] = [];
      if (item.imagenes) {
        imagenesABorrar.push(...item.imagenes);
      }
      if (tipo === 'paquete' && item.hotel && item.hotel.imagenes) {
        imagenesABorrar.push(...item.hotel.imagenes);
      }
      if (tipo === 'paquete' && item.vuelo && item.vuelo.imagenes) {
        imagenesABorrar.push(...item.vuelo.imagenes);
      }

      for (const imagen of imagenesABorrar) {
        if (!imagen.es_externa) {
          await this.imageHandlerService.deleteImageFile(imagen.url);
        }
      }
    }

    const result = await repository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`${tipo} con ID "${id}" no encontrado.`);
    }
    return {
      message: `${tipo} con ID "${id}" ha sido eliminado permanentemente.`,
    };
  }
}