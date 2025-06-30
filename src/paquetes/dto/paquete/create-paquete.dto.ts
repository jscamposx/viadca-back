import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateItinerarioDto } from '../itinerario/create-itinerario.dto';
import { CreateImagenDto } from '../imagen/create-imagen.dto';
export class CreatePaqueteDto {
  @IsString()
  @IsNotEmpty()
  nombre_paquete: string;

  @IsNumber()
  duracion: number;

  @IsOptional()
  @IsString()
  id_vuelo?: string;

  @IsOptional()
  @IsString()
  requisitos?: string;

  @IsString()
  @IsNotEmpty()
  origen: string;

  @IsOptional()
  @IsNumber()
  origen_lat?: number;

  @IsOptional()
  @IsNumber()
  origen_lng?: number;

  @IsString()
  @IsNotEmpty()
  destino: string;

  @IsOptional()
  @IsNumber()
  destino_lat?: number;

  @IsOptional()
  @IsNumber()
  destino_lng?: number;

  @IsNumber()
  precio_base: number;

  @ValidateNested({ each: true })
  @Type(() => CreateItinerarioDto)
  @IsOptional()
  itinerario?: CreateItinerarioDto[];

  @ValidateNested({ each: true })
  @Type(() => CreateImagenDto)
  @IsOptional()
  imagenes?: CreateImagenDto[];
}
