import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Paquete } from './paquete.entity';

@Entity()
export class Itinerario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dia: number;

  @Column('text')
  descripcion: string;

  @ManyToOne(() => Paquete, (paquete) => paquete.itinerario, {
    onDelete: 'CASCADE',
  })
  paquete: Paquete;
}
