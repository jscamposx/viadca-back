import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paquetes } from './entidades/paquetes.entity';
import { CreatePaqueteDto } from './dto/create-paquete.dto';

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

  private generateUrl(nombreDestino: string): string {
    const slug = nombreDestino.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const uniqueSuffix = Date.now();
    return `${slug}-${uniqueSuffix}`;
  }

  async create(createPaqueteDto: CreatePaqueteDto): Promise<Paquetes> {
    const url = this.generateUrl(createPaqueteDto.nombre_destino);

    const nuevo = this.paquetesRepository.create({
      ...createPaqueteDto,
      url,
    });

    return this.paquetesRepository.save(nuevo);
  }
}
