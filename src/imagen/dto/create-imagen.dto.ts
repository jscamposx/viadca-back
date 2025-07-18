import {
  IsString,
  IsOptional,
  IsUUID,
  IsUrl,
  ValidateIf,
  IsNotEmpty,
  IsInt, // Importar IsInt
} from 'class-validator';

export class CreateImagenDto {
  @ValidateIf((o) => !o.url)
  @IsNotEmpty()
  @IsString()
  image?: string;

  @ValidateIf((o) => !o.image)
  @IsUrl()
  @IsNotEmpty()
  url?: string;

  // Añadir la propiedad "orden"
  @IsOptional()
  @IsInt()
  orden?: number;

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