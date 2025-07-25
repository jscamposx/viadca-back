import {
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { Itinerario } from './itinerario.entity';
import { Imagen } from '../../imagen/entidades/imagen.entity';

import { Hotel } from '../../hoteles/entidades/hotel.entity';
import { Vuelo } from '../../vuelos/entidades/vuelo.entity';

@Entity({ name: 'paquetes' })
export class Paquete {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  nombre_paquete: string;

  @Column('int')
  duracion: number;

  @Column('varchar', { length: 255, unique: true })
  url: string;

  @ManyToOne(() => Vuelo, { eager: true, nullable: true,  onDelete: 'SET NULL',})
  @JoinColumn({ name: 'id_vuelo' })
  vuelo?: Vuelo;

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

  @Column('float')
  precio_base: number;

  @Column({ type: 'int', nullable: true })
  descuento?: number;

  @Column({ type: 'date', nullable: true })
  fecha_caducidad?: Date;

  @Column({ type: 'boolean', default: false })
  borrado: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  creadoEn: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  actualizadoEn: Date;

  @OneToMany(() => Itinerario, (itinerario) => itinerario.paquete, {
    cascade: true,
    eager: true,
  })
  itinerario: Itinerario[];

  @OneToMany(() => Imagen, (imagen) => imagen.paquete, {
    cascade: true,
    eager: true,
  })
  imagenes: Imagen[];

  @OneToOne(() => Hotel, (hotel) => hotel.paquete, {
    cascade: true,
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  hotel: Hotel;
}
