import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsDate,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateHotelDto } from '../../../hoteles/dto/create-hotel.dto';

class ItinerarioDto {
  @IsInt()
  dia: number;

  @IsString()
  @IsNotEmpty()
  descripcion: string;
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
  @IsString({ each: true })
  imageIds: string[];

  @IsObject()
  @ValidateNested()
  @Type(() => CreateHotelDto)
  hotel: CreateHotelDto;
}
