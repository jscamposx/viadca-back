import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from './entidades/hotel.entity';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { ImagenService } from '../imagen/imagen.service';

@Injectable()
export class HotelesService {
  constructor(
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
    private readonly imagenService: ImagenService,
  ) {}

  findAll(): Promise<Hotel[]> {
    return this.hotelRepository.find({
      where: { borrado: false },
      relations: ['imagenes'],
    });
  }

  async findOne(id: string): Promise<Hotel> {
    const hotel = await this.hotelRepository.findOne({
      where: { id, borrado: false },
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
      hotel.imagenes =
        await this.imagenService.procesarIdentificadoresDeImagen(imageIds);
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
      hotel.imagenes =
        await this.imagenService.procesarIdentificadoresDeImagen(imageIds);
    }

    return this.hotelRepository.save(hotel);
  }

  async remove(id: string): Promise<{ message: string }> {
    const hotel = await this.findOne(id);

    hotel.borrado = true;
    await this.hotelRepository.save(hotel);

    return { message: `Hotel con ID "${id}" ha sido marcado como eliminado.` };
  }
}
