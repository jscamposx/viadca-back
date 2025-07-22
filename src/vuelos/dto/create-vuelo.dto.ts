import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVueloDto {
  @IsString()
  @IsNotEmpty()
  transporte: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageIds?: string[];
}
