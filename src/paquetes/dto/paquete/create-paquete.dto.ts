import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class ItinerarioDto {
  @IsInt()
  dia: number;

  @IsString()
  @IsNotEmpty()
  descripcion: string;
}

class ImagenDto {
  @IsString()
  @IsNotEmpty()
  url: string;
}

class HotelDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsNumber()
  estrellas: number;

  @IsBoolean()
  isCustom: boolean;

  @IsInt()
  @IsOptional()
  total_calificaciones?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImagenDto)
  @IsOptional()
  images?: ImagenDto[];
}

export class CreatePaqueteDto {
  @IsString()
  @IsNotEmpty()
  nombre_paquete: string;

  @IsInt()
  duracion: number;

  @IsString()
  @IsOptional()
  id_vuelo?: string;

  @IsString()
  @IsOptional()
  requisitos?: string;

  @IsString()
  origen: string;

  @IsNumber()
  origen_lat: number;

  @IsNumber()
  origen_lng: number;

  @IsString()
  destino: string;

  @IsNumber()
  destino_lat: number;

  @IsNumber()
  destino_lng: number;

  @IsString()
  destino_place_id: string;

  @IsInt()
  precio_base: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItinerarioDto)
  itinerario: ItinerarioDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImagenDto)
  images: ImagenDto[];

  @IsObject()
  @ValidateNested()
  @Type(() => HotelDto)
  hotel: HotelDto;
}
