// src/imagen/dto/create-imagen.dto.ts

import {
  IsString,
  IsOptional,
  IsUUID,
  IsUrl,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';

export class CreateImagenDto {
  // Solo se requiere si no se proporciona `url`
  @ValidateIf((o) => !o.url)
  @IsNotEmpty()
  @IsString()
  image?: string; // Base64

  // Solo se requiere si no se proporciona `image`
  @ValidateIf((o) => !o.image)
  @IsUrl()
  @IsNotEmpty()
  url?: string; // URL externa

  @IsOptional()
  @IsUUID()
  paqueteId?: string;

  @IsOptional()
  @IsUUID()
  hotelId?: string;

  @IsOptional()
  @IsUUID()
  vueloId?: string;
}
