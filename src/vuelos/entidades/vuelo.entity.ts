import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Imagen } from '../../imagen/entidades/imagen.entity';

@Entity({ name: 'vuelos' })
export class Vuelo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  transporte: string;

  @Column('text')
  nombre: string;

  @Column({ type: 'boolean', default: false })
  borrado: boolean;

  @OneToMany(() => Imagen, (imagen) => imagen.vuelo, {
    cascade: true,
    eager: true,
  })
  imagenes?: Imagen[];

  @CreateDateColumn({ type: 'timestamp' })
  creadoEn: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  actualizadoEn: Date;
}
