import { IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class CreateItinerarioDto {
  @IsNumber()
  dia: number;

  @IsString()
  @IsNotEmpty()
  descripcion: string;
}
