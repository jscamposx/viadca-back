import { IsNotEmpty, IsString } from 'class-validator';

export class RestoreItemDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  tipo: string;
}
