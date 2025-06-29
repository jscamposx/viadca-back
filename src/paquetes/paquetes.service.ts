import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paquetes } from '../entidades/paquetes.entity';

@Injectable()
export class PaquetesService {
  constructor(
    @InjectRepository(Paquetes)
    private paquetesRepository: Repository<Paquetes>,
  ) {}

  findAll(): Promise<Paquetes[]> {
    return this.paquetesRepository.find();
  }

findOne(id: number): Promise<Paquetes | null> {
  return this.paquetesRepository.findOne({ where: { id } });
}


  create(paquete: Partial<Paquetes>): Promise<Paquetes> {
    const nuevo = this.paquetesRepository.create(paquete);
    return this.paquetesRepository.save(nuevo);
  }
}
