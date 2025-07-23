import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsInt,
} from 'class-validator';

export class CreateHotelDto {
  @IsString()
  @IsNotEmpty()
  placeId: string;

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
