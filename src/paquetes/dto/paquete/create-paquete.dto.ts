import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsDate,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  IsUUID,
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

  @IsInt()
  @IsOptional()
  orden?: number;
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
  @IsUUID('all', { each: true })
  @IsOptional()
  imageIds?: string[]; // Campo para los IDs de las imágenes del hotel
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

  @IsInt()
  @IsOptional()
  descuento?: number;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  fecha_caducidad?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItinerarioDto)
  itinerario: ItinerarioDto[];

  @IsArray()
  @IsUUID('all', { each: true })
  imageIds: string[];

  @IsObject()
  @ValidateNested()
  @Type(() => HotelDto)
  hotel: HotelDto;
}
