import {
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Itinerario } from './itinerario.entity';
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
  })
  @JoinColumn()
  hotel: Hotel;
}
