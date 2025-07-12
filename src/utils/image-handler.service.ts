// src/utils/image-handler.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { convertirAAvif } from './avif-converter.util';
import * as sharp from 'sharp';

@Injectable()
export class ImageHandlerService {
  private readonly uploadPath = path.join(
    __dirname,
    '..',
    '..',
    'public',
    'uploads',
  );

  constructor() {
    // Asegurarse de que el directorio de subida exista
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async saveImageFromUrl(
    imageUrl: string,
  ): Promise<{ url: string; path: string }> {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      });

      const buffer = Buffer.from(response.data as ArrayBuffer);

      return this.saveImage(buffer);
    } catch (error) {
      console.error(`Error al descargar la imagen desde ${imageUrl}:`, error);
      throw new InternalServerErrorException(
        'No se pudo descargar la imagen desde la URL.',
      );
    }
  }

  async saveImageFromBase64(
    base64Data: string,
  ): Promise<{ url: string; path: string }> {
    try {
      const base64Payload = base64Data.split(';base64,').pop() || base64Data;
      const buffer = Buffer.from(base64Payload, 'base64');
      return this.saveImage(buffer);
    } catch (error) {
      console.error('Error al procesar la imagen en Base64:', error);
      throw new InternalServerErrorException(
        'No se pudo procesar la imagen en Base64.',
      );
    }
  }

  private async saveImage(
    buffer: Buffer,
  ): Promise<{ url: string; path: string }> {
    try {
      // Redimensionar la imagen
      const resizedBuffer = await sharp(buffer)
        .resize({
          width: 1920,
          height: 1080,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toBuffer();

      const avifBuffer = await convertirAAvif(resizedBuffer);
      const filename = `${uuidv4()}.avif`;
      const filePath = path.join(this.uploadPath, filename);
      const fileUrl = `/uploads/${filename}`; // URL pública

      fs.writeFileSync(filePath, avifBuffer);

      return { url: fileUrl, path: filePath };
    } catch (error) {
      console.error('Error al guardar o convertir la imagen:', error);
      throw new InternalServerErrorException(
        'Error interno al guardar la imagen.',
      );
    }
  }
}