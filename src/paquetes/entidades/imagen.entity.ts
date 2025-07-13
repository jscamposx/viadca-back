import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Paquete } from './paquete.entity';
import { Hotel } from './hotel.entity';

@Entity({ name: 'imagenes' })
export class Imagen {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  url: string;

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
