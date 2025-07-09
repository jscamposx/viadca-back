// src/paquetes/dto/create-paquete.dto.ts

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

// DTO para el itinerario
class ItinerarioDto {
  @IsInt()
  dia: number;

  @IsString()
  @IsNotEmpty()
  descripcion: string;
}

// DTO para las imágenes
class ImagenDto {
  @IsString()
  @IsNotEmpty()
  url: string;
}

// DTO para el hotel
class HotelDto {
  @IsString()
  @IsNotEmpty()
  id: string; // En el DTO viene como 'id', lo mapearemos a 'placeId' en el servicio

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

  // Las imágenes del hotel son opcionales y solo para hoteles custom
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImagenDto)
  @IsOptional()
  images?: ImagenDto[];
}

// DTO principal para crear el paquete
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
  imagenes: ImagenDto[]; // Imágenes generales del paquete

  @IsObject()
  @ValidateNested()
  @Type(() => HotelDto)
  hotel: HotelDto;
}
