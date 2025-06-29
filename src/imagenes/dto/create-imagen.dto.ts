import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';

export class CreateImagenDto {
  @IsEnum(['paquete', 'vuelo', 'hotel'])
  entidad_tipo: 'paquete' | 'vuelo' | 'hotel';

  @IsInt()
  @IsPositive()
  entidad_id: number;

  @IsOptional()
  @IsInt()
  orden?: number;

  @IsOptional()
  @IsEnum(['carrusel', 'galeria', 'mapa'])
  tipo?: 'carrusel' | 'galeria' | 'mapa';
}
