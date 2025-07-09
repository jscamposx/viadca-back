// src/paquetes/entities/hotel.entity.ts

import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Imagen } from './imagen.entity';
import { Paquete } from './paquete.entity';

@Entity({ name: 'hoteles' })
export class Hotel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ID que viene de Google Places API o uno custom (ej: "custom-1752017487445")
  @Column('text', { unique: true })
  placeId: string;

  @Column('text')
  nombre: string;

  @Column('float')
  estrellas: number;

  @Column('boolean', { default: false })
  isCustom: boolean;

  @Column('int', { nullable: true })
  total_calificaciones?: number;

  // Relación con las imágenes (solo si es un hotel personalizado)
  @OneToMany(() => Imagen, (imagen) => imagen.hotel, {
    cascade: true,
    eager: true, // Cargar las imágenes automáticamente
  })
  imagenes?: Imagen[];

  // Un hotel pertenece a un solo paquete
  @OneToOne(() => Paquete, (paquete) => paquete.hotel)
  paquete: Paquete;
}
