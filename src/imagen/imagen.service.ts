import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Imagen } from './entidades/imagen.entity';
import { CreateImagenDto } from './dto/create-imagen.dto';
import { Paquete } from '../paquetes/entidades/paquete.entity';
import { Hotel } from '../paquetes/entidades/hotel.entity';
import { Vuelo } from '../paquetes/entidades/vuelo.entity';
import { ImageHandlerService } from '../utils/image-handler.service';
import { CreateImagenUrlDto } from './dto/create-imagen-url.dto'; // Importamos el nuevo DTO

@Injectable()
export class ImagenService {
  constructor(
    @InjectRepository(Imagen)
    private readonly imagenRepository: Repository<Imagen>,
    @InjectRepository(Paquete)
    private readonly paqueteRepository: Repository<Paquete>,
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
    @InjectRepository(Vuelo)
    private readonly vueloRepository: Repository<Vuelo>,
    private readonly imageHandlerService: ImageHandlerService,
  ) {}

  async createFromBase64(
    createImagenDto: CreateImagenDto,
  ): Promise<Imagen> {
    const { image: base64Image, paqueteId, hotelId, vueloId } = createImagenDto;
    
    const { url } = await this.imageHandlerService.saveImageFromBase64(base64Image);

    const nuevaImagen = new Imagen();
    nuevaImagen.url = url;

    if (paqueteId) {
      const paquete = await this.paqueteRepository.findOne({ where: { id: paqueteId } });
      if (!paquete) throw new NotFoundException(`Paquete con ID "${paqueteId}" no encontrado`);
      nuevaImagen.paquete = paquete;
    }

    if (hotelId) {
      const hotel = await this.hotelRepository.findOne({ where: { id: hotelId } });
      if (!hotel) throw new NotFoundException(`Hotel con ID "${hotelId}" no encontrado`);
      nuevaImagen.hotel = hotel;
    }

    if (vueloId) {
      const vuelo = await this.vueloRepository.findOne({ where: { id: vueloId } });
      if (!vuelo) throw new NotFoundException(`Vuelo con ID "${vueloId}" no encontrado`);
      nuevaImagen.vuelo = vuelo;
    }

    return this.imagenRepository.save(nuevaImagen);
  }


    async createFromUrl(
    createImagenUrlDto: CreateImagenUrlDto,
  ): Promise<Imagen> {
    const { url: imageUrl, paqueteId, hotelId, vueloId } = createImagenUrlDto;
    
    // 1. Usamos el método existente para descargar y guardar la imagen de la URL
    const { url } = await this.imageHandlerService.saveImageFromUrl(imageUrl);

    const nuevaImagen = new Imagen();
    nuevaImagen.url = url; // Guardamos la URL local, no la de pexels.com

    // 2. Asociamos la imagen a la entidad correspondiente
    if (paqueteId) {
      const paquete = await this.paqueteRepository.findOne({ where: { id: paqueteId } });
      if (!paquete) throw new NotFoundException(`Paquete con ID "${paqueteId}" no encontrado`);
      nuevaImagen.paquete = paquete;
    }
    // ... (lógica idéntica para hotelId y vueloId)

    // 3. Guardamos el registro en la base de datos
    return this.imagenRepository.save(nuevaImagen);
  }
  
  findAll(): Promise<Imagen[]> {
    return this.imagenRepository.find({ relations: ['paquete', 'hotel', 'vuelo'] });
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.imagenRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Imagen con ID "${id}" no encontrada`);
    }
    return { message: `Imagen con ID "${id}" ha sido eliminada.` };
  }
}