import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vuelo } from './entidades/vuelo.entity';
import { CreateVueloDto } from './dto/vuelo/create-vuelo.dto';
import { UpdateVueloDto } from './dto/vuelo/update-vuelo.dto';
import { Imagen } from './entidades/imagen.entity';

@Injectable()
export class VuelosService {
  constructor(
    @InjectRepository(Vuelo)
    private readonly vueloRepository: Repository<Vuelo>,
    @InjectRepository(Imagen) // Inyectar el repositorio de Imagen
    private readonly imagenRepository: Repository<Imagen>,
  ) {}

  findAll(): Promise<Vuelo[]> {
    // Asegurarse de cargar la relación de imágenes
    return this.vueloRepository.find({ relations: ['imagenes'] });
  }

  async findOne(id: string): Promise<Vuelo> {
    const vuelo = await this.vueloRepository.findOne({
      where: { id },
      relations: ['imagenes'], // Cargar la relación
    });
    if (!vuelo) {
      throw new NotFoundException(`Vuelo con ID "${id}" no encontrado`);
    }
    return vuelo;
  }

  async create(createVueloDto: CreateVueloDto): Promise<Vuelo> {
    const { imagenes, ...vueloDetails } = createVueloDto;
    const vuelo = this.vueloRepository.create({
      ...vueloDetails,
      imagenes: imagenes
        ? imagenes.map((imgDto) => this.imagenRepository.create(imgDto))
        : [],
    });
    return this.vueloRepository.save(vuelo);
  }

  async update(id: string, updateVueloDto: UpdateVueloDto): Promise<Vuelo> {
    const { imagenes, ...vueloDetails } = updateVueloDto;
    const vuelo = await this.vueloRepository.preload({
      id: id,
      ...vueloDetails,
    });

    if (!vuelo) {
      throw new NotFoundException(`Vuelo con ID "${id}" no encontrado`);
    }

    if (imagenes) {
      // Eliminar las imágenes antiguas asociadas a este vuelo
      const imagenesAnteriores = await this.imagenRepository.find({ where: { vuelo: { id } } });
      if (imagenesAnteriores.length > 0) {
        await this.imagenRepository.remove(imagenesAnteriores);
      }
      // Crear las nuevas imágenes
      vuelo.imagenes = imagenes.map((imgDto) => this.imagenRepository.create(imgDto));
    }

    return this.vueloRepository.save(vuelo);
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.vueloRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Vuelo con ID "${id}" no encontrado`);
    }
    return { message: `Vuelo con ID "${id}" ha sido eliminado.` };
  }
}