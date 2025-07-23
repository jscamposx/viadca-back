import { Controller, Get, Param, Patch, Delete, Body } from '@nestjs/common';
import { PapeleraService } from './papelera.service';
import { RestoreItemDto } from './dto/restore-item.dto';

@Controller('papelera')
export class PapeleraController {
  constructor(private readonly papeleraService: PapeleraService) {}

  @Get()
  findAll() {
    return this.papeleraService.findAll();
  }

  @Patch('restaurar')
  restore(@Body() restoreItemDto: RestoreItemDto) {
    return this.papeleraService.restore(restoreItemDto.id, restoreItemDto.tipo);
  }

  @Delete(':tipo/:id')
  remove(@Param('tipo') tipo: string, @Param('id') id: string) {
    return this.papeleraService.remove(id, tipo);
  }
}
