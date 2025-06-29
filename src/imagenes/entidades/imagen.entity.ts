import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('imagenes')
export class Imagen {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['paquete', 'vuelo', 'hotel'] })
  entidad_tipo: 'paquete' | 'vuelo' | 'hotel';

  @Column()
  entidad_id: number;

  @Column({ type: 'longblob' })
  imagen: Buffer;

  @Column()
  mime_type: string; 

  @Column({ default: 0 })
  orden: number;

  @Column({ type: 'enum', enum: ['carrusel', 'galeria', 'mapa'], default: 'carrusel' })
  tipo: 'carrusel' | 'galeria' | 'mapa';
}
