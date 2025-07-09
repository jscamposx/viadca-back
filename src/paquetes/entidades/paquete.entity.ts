// src/paquetes/entities/paquete.entity.ts

import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Itinerario } from './itinerario.entity'; // Asegúrate de tener esta entidad
import { Imagen } from './imagen.entity';
import { Hotel } from './hotel.entity';

@Entity({ name: 'paquetes' })
export class Paquete {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  nombre_paquete: string;

  @Column('int')
  duracion: number;

    @Column('text', { unique: true })
  url: string;

  @Column('text', { nullable: true })
  id_vuelo?: string;

  @Column('text', { nullable: true })
  requisitos?: string;

  @Column('text')
  origen: string;

  @Column('float')
  origen_lat: number;

  @Column('float')
  origen_lng: number;

  @Column('text')
  destino: string;

  @Column('float')
  destino_lat: number;

  @Column('float')
  destino_lng: number;

  @Column('text')
  destino_place_id: string;

  @Column('int')
  precio_base: number;

  // Relación con Itinerarios (asumiendo que la tienes)
  @OneToMany(() => Itinerario, (itinerario) => itinerario.paquete, {
    cascade: true,
    eager: true,
  })
  itinerario: Itinerario[];

  // Relación con las imágenes generales del paquete
  @OneToMany(() => Imagen, (imagen) => imagen.paquete, {
    cascade: true,
    eager: true,
  })
  imagenes: Imagen[];

  // Relación con el hotel (sea de Google o personalizado)
  @OneToOne(() => Hotel, (hotel) => hotel.paquete, {
    cascade: true,
    eager: true,
  })
  @JoinColumn() // Paquete es el dueño de la relación y tendrá la columna hotelId
  hotel: Hotel;
}
