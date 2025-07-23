// src/imagen/entidades/imagen.entity.ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Paquete } from '../../paquetes/entidades/paquete.entity';
import { Hotel } from '../../hoteles/entidades/hotel.entity';
import { Vuelo } from '../../vuelos/entidades/vuelo.entity';

@Entity({ name: 'imagenes' })
export class Imagen {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  url: string;

  @Column({ type: 'int', nullable: true })
  orden: number;

  @Column({ default: false })
  es_externa: boolean;

  @Column({ type: 'boolean', default: false }) // <-- Columna para el soft delete
  borrado: boolean;

  @ManyToOne(() => Paquete, (paquete) => paquete.imagenes, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  paquete?: Paquete;

  @ManyToOne(() => Hotel, (hotel) => hotel.imagenes, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  hotel?: Hotel;

  @ManyToOne(() => Vuelo, (vuelo) => vuelo.imagenes, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  vuelo?: Vuelo;
}
