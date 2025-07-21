import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { isUUID } from 'class-validator';
import { Hotel } from './entidades/hotel.entity';
import { Imagen } from '../imagen/entidades/imagen.entity';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';

@Injectable()
export class HotelesService {
  constructor(
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
    @InjectRepository(Imagen)
    private readonly imagenRepository: Repository<Imagen>,
  ) {}

  findAll(): Promise<Hotel[]> {
    return this.hotelRepository.find({ relations: ['imagenes'] });
  }

  async findOne(id: string): Promise<Hotel> {
    const hotel = await this.hotelRepository.findOne({
      where: { id },
      relations: ['imagenes'],
    });
    if (!hotel) {
      throw new NotFoundException(`Hotel con ID "${id}" no encontrado`);
    }
    return hotel;
  }

  async create(createHotelDto: CreateHotelDto): Promise<Hotel> {
    const { imageIds, ...hotelDetails } = createHotelDto;
    const hotel = this.hotelRepository.create(hotelDetails);

    if (imageIds) {
      hotel.imagenes = await this.procesarIdentificadoresDeImagen(imageIds);
    }

    return this.hotelRepository.save(hotel);
  }

  async update(id: string, updateHotelDto: UpdateHotelDto): Promise<Hotel> {
    const { imageIds, ...hotelDetails } = updateHotelDto;
    const hotel = await this.hotelRepository.preload({
      id,
      ...hotelDetails,
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel con ID "${id}" no encontrado`);
    }

    if (imageIds) {
      hotel.imagenes = await this.procesarIdentificadoresDeImagen(imageIds);
    }

    return this.hotelRepository.save(hotel);
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.hotelRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Hotel con ID "${id}" no encontrado`);
    }
    return { message: `Hotel con ID "${id}" ha sido eliminado.` };
  }

  private async procesarIdentificadoresDeImagen(
    identificadores: string[],
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
}
