import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateImagenUrlDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url: string; // Validará que sea una URL válida

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
