import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Paquetes } from './paquetes.entity';

@Entity()
export class ImagenPaquete {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  mime_type: string;

  @Column()
  url: string;

  @Column({ default: 0 })
  orden: number;

  @ManyToOne(() => Paquetes, (paquete) => paquete.imagenes, {
    onDelete: 'CASCADE',
  })
  paquete: Paquetes;
}