// src/paquetes/entidades/imagen.entity.ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Paquete } from './paquete.entity';
import { Hotel } from './hotel.entity';

@Entity({ name: 'imagenes' })
export class Imagen {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // La URL puede ser la ruta al archivo en nuestro servidor o una URL externa
  @Column('text')
  url: string;

  // Nuevo campo para la ruta del archivo local
  @Column('text', { nullable: true })
  path?: string;

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
}