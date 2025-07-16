import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsBase64,
} from 'class-validator';

export class CreateImagenDto {
  @IsString()
  @IsNotEmpty()
  // No es necesaria la validación IsBase64 aquí si la decodificación se maneja en el servicio
  image: string; // Recibirá la cadena Base64 completa (ej: "data:image/jpeg;base64,...")

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
