import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

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


  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImagenDto)
  @IsOptional()
  imagenes?: ImagenDto[];
}