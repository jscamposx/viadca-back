import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Itinerario } from './itinerario.entity';

@Entity()
export class Paquetes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre_destino: string;

  @Column({ unique: true, length: 255 })
  url: string;

  @Column()
  duracion: number;

  @Column({ nullable: true, length: 50 })
  id_vuelo: string;

  @Column('text', { nullable: true })
  requisitos: string;

  @Column({ length: 100 })
  origen: string;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  origen_lat?: number;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  origen_lng?: number;

  @Column({ length: 100 })
  destino: string;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  destino_lat?: number;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  destino_lng?: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precio_base: number;

  @OneToMany(() => Itinerario, (itinerario) => itinerario.paquete, {
    cascade: true, 
    eager: true,  
  })
  itinerario: Itinerario[];
}
