// src/paquetes/entities/imagen.entity.ts

import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Paquete } from './paquete.entity';
import { Hotel } from './hotel.entity';

@Entity({ name: 'imagenes' })
export class Imagen {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  url: string;

  // Una imagen puede pertenecer a un paquete (y el hotelId será null)
  @ManyToOne(() => Paquete, (paquete) => paquete.imagenes, {
    nullable: true,
    onDelete: 'CASCADE', // Si se borra el paquete, sus imágenes también
  })
  paquete?: Paquete;

  // O puede pertenecer a un hotel (y el paqueteId será null)
  @ManyToOne(() => Hotel, (hotel) => hotel.imagenes, {
    nullable: true,
    onDelete: 'CASCADE', // Si se borra el hotel, sus imágenes también
  })
  hotel?: Hotel;
}
