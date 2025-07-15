import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany, // Importar OneToMany
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Imagen } from './imagen.entity'; // Importar Imagen

@Entity({ name: 'vuelos' })
export class Vuelo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  transporte: string;

  @Column('text')
  nombre: string;
  
  // Se elimina la columna 'imagen' y se reemplaza por la relación
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