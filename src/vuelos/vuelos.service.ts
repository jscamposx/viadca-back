import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vuelo } from './entidades/vuelo.entity';
import { CreateVueloDto } from './dto/create-vuelo.dto';
import { UpdateVueloDto } from './dto/update-vuelo.dto';
import { ImagenService } from '../imagen/imagen.service';

@Injectable()
export class VuelosService {
  constructor(
    @InjectRepository(Vuelo)
    private readonly vueloRepository: Repository<Vuelo>,
    private readonly imagenService: ImagenService,
  ) {}

  findAll(): Promise<Vuelo[]> {
    return this.vueloRepository.find({
      where: { borrado: false },
      relations: ['imagenes'],
    });
  }

  async findOne(id: string): Promise<Vuelo> {
    const vuelo = await this.vueloRepository.findOne({
      where: { id, borrado: false },
      relations: ['imagenes'],
    });
    if (!vuelo) {
      throw new NotFoundException(`Vuelo con ID "${id}" no encontrado`);
    }
    return vuelo;
  }

  async create(createVueloDto: CreateVueloDto): Promise<Vuelo> {
    const { imageIds, ...vueloDetails } = createVueloDto;
    const vuelo = this.vueloRepository.create(vueloDetails);

    if (imageIds) {
      vuelo.imagenes =
        await this.imagenService.procesarIdentificadoresDeImagen(imageIds);
    }

    return this.vueloRepository.save(vuelo);
  }

  async update(id: string, updateVueloDto: UpdateVueloDto): Promise<Vuelo> {
    const { imageIds, ...vueloDetails } = updateVueloDto;

    const vueloPreload = await this.vueloRepository.preload({
      id,
      ...vueloDetails,
    });

    if (!vueloPreload) {
      throw new NotFoundException(`Error al precargar el vuelo con ID "${id}"`);
    }

    if (imageIds) {
      vueloPreload.imagenes =
        await this.imagenService.procesarIdentificadoresDeImagen(imageIds);
    }

    return this.vueloRepository.save(vueloPreload);
  }

  async remove(id: string): Promise<{ message: string }> {
    const vuelo = await this.findOne(id);

    vuelo.borrado = true;
    await this.vueloRepository.save(vuelo);

    return { message: `Vuelo con ID "${id}" ha sido marcado como eliminado.` };
  }
}
