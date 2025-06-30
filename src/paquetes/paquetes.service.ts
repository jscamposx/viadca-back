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
      relations: ['itinerario', 'imagenes'],
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
  
  async updateByUrl(url: string, updatePaqueteDto: UpdatePaqueteDto) {
    const paquete = await this.findByUrl(url);
    if (!paquete) {
      throw new NotFoundException(`Paquete con url "${url}" no encontrado`);
    }
    const paqueteActualizado = this.paquetesRepository.merge(
      paquete,
      updatePaqueteDto,
    );
    return this.paquetesRepository.save(paqueteActualizado);
  }

 
  async removeByUrl(url: string) {
    const paquete = await this.findByUrl(url);
    if (!paquete) {
      throw new NotFoundException(`Paquete con url "${url}" no encontrado`);
    }


    const rutaDirectorio = path.join(process.cwd(), 'public', 'images', paquete.url);
    if (fs.existsSync(rutaDirectorio)) {
      fs.rmSync(rutaDirectorio, { recursive: true, force: true });
    }
    

    await this.paquetesRepository.remove(paquete);
    return { message: `Paquete con url "${url}" y sus archivos han sido eliminados.` };
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
    const imagen = await this.imagenRepository.findOne({ where: { id }, relations: ['paquete'] });
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


    if (imagen.paquete) {
        const rutaDirectorio = path.join(process.cwd(), 'public', 'images', imagen.paquete.url);
        const archivosRestantes = fs.readdirSync(rutaDirectorio);
        if (archivosRestantes.length === 0) {
            fs.rmdirSync(rutaDirectorio);
        }
    }
    
    return { message: `Imagen con id "${id}" eliminada` };
  }
}