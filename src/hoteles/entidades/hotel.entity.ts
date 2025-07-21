import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Imagen } from '../../imagen/entidades/imagen.entity';
import { Paquete } from '../../paquetes/entidades/paquete.entity';

@Entity({ name: 'hoteles' })
export class Hotel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255, unique: true })
  placeId: string;

  @Column('text')
  nombre: string;

  @Column('float')
  estrellas: number;

  @Column('boolean', { default: false })
  isCustom: boolean;

  @Column('int', { nullable: true })
  total_calificaciones?: number;

  @OneToMany(() => Imagen, (imagen) => imagen.hotel, {
    cascade: true,
    eager: true,
  })
  imagenes?: Imagen[];

  @OneToOne(() => Paquete, (paquete) => paquete.hotel)
  paquete: Paquete;
}
