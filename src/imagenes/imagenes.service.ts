import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Imagen } from './entidades/imagen.entity';

interface CreateImagenInput {
  entidad_tipo: 'paquete' | 'vuelo' | 'hotel';
  entidad_id: number;
  imagen: Buffer;
  mime_type: string;
  orden?: number;
  tipo?: 'carrusel' | 'galeria' | 'mapa';
}

@Injectable()
export class ImagenesService {
  constructor(
    @InjectRepository(Imagen)
    private imagenesRepository: Repository<Imagen>,
  ) {}

  async create(data: CreateImagenInput): Promise<Imagen> {
    const imagen = this.imagenesRepository.create(data);
    return this.imagenesRepository.save(imagen);
  }

  async findOne(id: number) {
  return this.imagenesRepository.findOneBy({ id });
}

}
