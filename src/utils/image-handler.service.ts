import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import * as path from 'path';
import { Worker } from 'worker_threads';

@Injectable()
export class ImageHandlerService {
  async saveImageFromUrl(imageUrl: string): Promise<{ url: string }> {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      });

      const buffer = Buffer.from(response.data as ArrayBuffer);

      return this.processImageInWorker(buffer);
    } catch (error) {
      console.error(`Error al descargar la imagen desde ${imageUrl}:`, error);
      throw new InternalServerErrorException(
        'No se pudo descargar la imagen desde la URL.',
      );
    }
  }

  async saveImageFromBase64(base64Data: string): Promise<{ url: string }> {
    try {
      const base64Payload = base64Data.split(';base64,').pop() || base64Data;
      const buffer = Buffer.from(base64Payload, 'base64');
      return this.processImageInWorker(buffer);
    } catch (error) {
      console.error('Error al procesar la imagen en Base64:', error);
      throw new InternalServerErrorException(
        'No se pudo procesar la imagen en Base64.',
      );
    }
  }

  async saveImageFromBuffer(buffer: Buffer): Promise<{ url: string }> {
    try {
      return this.processImageInWorker(buffer);
    } catch (error) {
      console.error('Error al procesar la imagen desde el buffer:', error);
      throw new InternalServerErrorException(
        'No se pudo procesar la imagen desde el buffer.',
      );
    }
  }

  private processImageInWorker(buffer: Buffer): Promise<{ url: string }> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(path.join(__dirname, 'image-worker.js'), {
        workerData: { buffer },
      });

      worker.on('message', (result) => {
        if (result.status === 'done') {
          resolve({ url: result.url });
        } else {
          reject(new InternalServerErrorException(result.message));
        }
      });

      worker.on('error', reject);

      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(
            new InternalServerErrorException(
              `El worker se detuvo con el código de salida ${code}`,
            ),
          );
        }
      });
    });
  }
}
