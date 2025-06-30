import { IsString, IsNotEmpty, IsInt, Min, IsOptional } from 'class-validator';

export class CreateImagenDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  mime_type: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  orden?: number;
}
