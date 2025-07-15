import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

// DTO para la data de la imagen
class ImagenDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsInt()
  @IsOptional()
  orden?: number;
}

export class CreateVueloDto {
  @IsString()
  @IsNotEmpty()
  transporte: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  // Aceptar un arreglo de imágenes
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImagenDto)
  @IsOptional()
  imagenes?: ImagenDto[];
}