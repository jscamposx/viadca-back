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
    @InjectRepository(Imagen) // Repositorio de Imagen inyectado
    private readonly imagenRepository: Repository<Imagen>,
    private readonly imageHandlerService: ImageHandlerService,
  ) {}

  async findAll() {
    const paquetes = await this.paqueteRepository.find({
      where: { borrado: true },
    });

    const hoteles = await this.hotelRepository.find({ // Ahora también busca hoteles
      where: { borrado: true },
    });

    const vuelos = await this.vueloRepository.find({
      where: { borrado: true },
    });

    return {
      paquetes,
      hoteles,
      vuelos,
    };
  }

  async restore(id: string, tipo: string) {
    switch (tipo) {
      case 'paquete': {
        const paquete = await this.paqueteRepository.findOne({
          where: { id, borrado: true },
          relations: ['hotel', 'vuelo'],
        });

        if (!paquete) {
          throw new NotFoundException(
            `Paquete con ID "${id}" no encontrado en la papelera.`,
          );
        }

        paquete.borrado = false;
        if (paquete.hotel) {
          paquete.hotel.borrado = false;
          await this.hotelRepository.save(paquete.hotel);
        }
        if (paquete.vuelo) {
          paquete.vuelo.borrado = false;
          await this.vueloRepository.save(paquete.vuelo);
        }

        await this.paqueteRepository.save(paquete);
        return {
          message: `Paquete con ID "${id}" y sus elementos asociados han sido restaurados.`,
        };
      }
      case 'hotel': { // Nueva lógica para restaurar hoteles
        const hotel = await this.hotelRepository.findOne({
            where: { id, borrado: true },
        });
        if (!hotel) {
            throw new NotFoundException(`Hotel con ID "${id}" no encontrado en la papelera.`);
        }
        hotel.borrado = false;
        await this.hotelRepository.save(hotel);
        return { message: `Hotel con ID "${id}" ha sido restaurado.` };
      }
      case 'vuelo': {
        const vuelo = await this.vueloRepository.findOne({
          where: { id, borrado: true },
        });

        if (!vuelo) {
          throw new NotFoundException(
            `Vuelo con ID "${id}" no encontrado en la papelera.`,
          );
        }

        vuelo.borrado = false;
        await this.vueloRepository.save(vuelo);
        return { message: `Vuelo con ID "${id}" ha sido restaurado.` };
      }
      default:
        throw new NotFoundException(`Tipo de entidad "${tipo}" no válido.`);
    }
  }

  async remove(id: string, tipo: string) {
    let repository: Repository<any>;
    let relations: string[] = [];
    switch (tipo) {
      case 'paquete':
        repository = this.paqueteRepository;
        relations = ['imagenes', 'hotel', 'hotel.imagenes', 'vuelo.imagenes']; // Se carga la relación 'hotel' completa
        break;
      case 'hotel': // Nueva lógica para eliminar hoteles
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
      // Se asegura de incluir las imágenes del hotel cuando el tipo es 'paquete'
      if (tipo === 'paquete' && item.hotel && item.hotel.imagenes) {
        imagenesABorrar.push(...item.hotel.imagenes);
      }
      if (tipo === 'paquete' && item.vuelo && item.vuelo.imagenes) {
        imagenesABorrar.push(...item.vuelo.imagenes);
      }

      // Elimina los archivos de imagen y luego los registros de la BD
      for (const imagen of imagenesABorrar) {
        if (!imagen.es_externa) {
          await this.imageHandlerService.deleteImageFile(imagen.url);
        }
        await this.imagenRepository.remove(imagen);
      }

      // Si es un paquete y tiene un hotel, se elimina el hotel
      if (tipo === 'paquete' && item.hotel) {
        await this.hotelRepository.remove(item.hotel);
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