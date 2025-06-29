import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paquetes } from './entidades/paquetes.entity';
import { CreatePaqueteDto } from './dto/create-paquete.dto';
import { generarCodigoUnico } from '../utils/generar-url.util';

@Injectable()
export class PaquetesService {
  constructor(
    @InjectRepository(Paquetes)
    private paquetesRepository: Repository<Paquetes>,
  ) {}

  findAll(): Promise<Paquetes[]> {
    return this.paquetesRepository.find({ relations: ['itinerario'] });
  }

  findOne(id: number): Promise<Paquetes | null> {
    return this.paquetesRepository.findOne({
      where: { id },
      relations: ['itinerario'],
    });
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

    const nuevo = this.paquetesRepository.create({
      ...createPaqueteDto,
      url,
    });

    return this.paquetesRepository.save(nuevo);
  }

  async findByUrl(url: string): Promise<Paquetes | null> {
    return this.paquetesRepository.findOne({
      where: { url },
      relations: ['itinerario'],
    });
  }
}
