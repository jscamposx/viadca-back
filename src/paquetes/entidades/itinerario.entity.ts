import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Paquetes } from './paquetes.entity';

@Entity()
export class Itinerario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dia: number;

  @Column('text')
  descripcion: string;

  @ManyToOne(() => Paquetes, paquete => paquete.itinerario, {
    onDelete: 'CASCADE', 
  })
  paquete: Paquetes;
}
