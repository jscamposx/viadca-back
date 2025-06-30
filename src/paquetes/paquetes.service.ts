import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paquetes } from './entidades/paquetes.entity';
import { ImagenPaquete } from './entidades/imagen-paquete.entity';
import { CreatePaqueteDto } from './dto/paquete/create-paquete.dto';
import { UpdatePaqueteDto } from './dto/paquete/update-paquete.dto';
import { UpdateImagenDto } from './dto/imagen/update-imagen.dto';
import { generarCodigoUnico } from '../utils/generar-url.util';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PaquetesService {
  constructor(
    @InjectRepository(Paquetes)
    private paquetesRepository: Repository<Paquetes>,
    @InjectRepository(ImagenPaquete)
    private imagenRepository: Repository<ImagenPaquete>,
  ) {}

  findAll(): Promise<Paquetes[]> {
    return this.paquetesRepository.find({ relations: ['itinerario'] });
  }

  async findOne(id: number): Promise<Paquetes> {
    const paquete = await this.paquetesRepository.findOne({
      where: { id },
      relations: ['itinerario'],
    });
    if (!paquete) {
      throw new NotFoundException(`Paquete con id "${id}" no encontrado`);
    }
    return paquete;
  }

  private async generarUrlUnica(): Promise<string> {
    let intento = 0;
    let url = '';
    let existe: Paquetes | null = null;

    do {
      url = generarCodigoUnico(5);
      existe = await this.paquetesRepository.findOne({ where: { url } });
      intento++;
    } while (existe && intento < 10);

    if (existe) {
      throw new Error(
        'No se pudo generar una URL única después de varios intentos',
      );
    }

    return url;
  }

  async create(createPaqueteDto: CreatePaqueteDto): Promise<Paquetes> {
    const url = await this.generarUrlUnica();

    const nuevoPaquete = this.paquetesRepository.create({
      ...createPaqueteDto,
      url,
    });

    return this.paquetesRepository.save(nuevoPaquete);
  }

  async update(id: number, updatePaqueteDto: UpdatePaqueteDto) {
    const paquete = await this.paquetesRepository.preload({
      id: id,
      ...updatePaqueteDto,
    });
    if (!paquete) {
      throw new NotFoundException(`Paquete con id "${id}" no encontrado`);
    }
    return this.paquetesRepository.save(paquete);
  }

  async remove(id: number) {
    const paquete = await this.findOne(id);
    await this.paquetesRepository.remove(paquete);
    return { message: `Paquete con id "${id}" eliminado` };
  }

  async findByUrl(url: string): Promise<Paquetes | null> {
    const paquete = await this.paquetesRepository.findOne({
      where: { url },
      relations: ['itinerario', 'imagenes'],
      order: { imagenes: { orden: 'ASC' } },
    });

    return paquete;
  }

  async findImageById(id: number): Promise<ImagenPaquete> {
    const imagen = await this.imagenRepository.findOne({ where: { id } });
    if (!imagen) {
      throw new NotFoundException(`Imagen con id "${id}" no encontrada`);
    }
    return imagen;
  }

  async updateImage(id: number, updateImagenDto: UpdateImagenDto) {
    const imagen = await this.imagenRepository.preload({
      id,
      ...updateImagenDto,
    });
    if (!imagen) {
      throw new NotFoundException(`Imagen con id "${id}" no encontrada`);
    }
    return this.imagenRepository.save(imagen);
  }

  async removeImage(id: number) {
    const imagen = await this.findImageById(id);
    const rutaArchivo = path.join(process.cwd(), 'public', imagen.url);

    if (fs.existsSync(rutaArchivo)) {
      fs.unlinkSync(rutaArchivo);
    }
    await this.imagenRepository.remove(imagen);
    return { message: `Imagen con id "${id}" eliminada` };
  }
}