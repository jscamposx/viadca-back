// src/paquetes/dto/paquete/create-paquete.dto.ts - CÓDIGO CORREGIDO

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
} from 'class-validator';

class ItinerarioDto {
  @IsInt()
  dia: number;

  @IsString()
  @IsNotEmpty()
  descripcion: string;
}

// ✅ DTO de Hotel corregido y simplificado
class HotelDto {
  @IsString()
  @IsNotEmpty()
  placeId: string; // El único identificador que necesitamos

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
  @IsString({ each: true })
  @IsOptional()
  imageIds?: string[];
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
  @IsString({ each: true }) // Permite UUIDs y URLs
  imageIds: string[];

  @IsObject()
  @ValidateNested()
  @Type(() => HotelDto)
  hotel: HotelDto;
}