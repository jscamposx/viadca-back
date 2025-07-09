// src/paquetes/entidades/itinerario.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Paquete } from './paquete.entity'; // Corrected import

@Entity()
export class Itinerario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dia: number;

  @Column('text')
  descripcion: string;

  @ManyToOne(() => Paquete, (paquete) => paquete.itinerario, { // Corrected type
    onDelete: 'CASCADE',
  })
  paquete: Paquete;
}