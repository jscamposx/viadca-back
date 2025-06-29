import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

  @Column({ length: 100 })
  destino: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precio_base: number;
}
