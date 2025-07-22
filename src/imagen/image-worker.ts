import { parentPort, workerData } from 'worker_threads';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

interface WorkerData {
  buffer: Buffer;
}

async function convertirAAvif(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .avif({
      quality: 70,
      chromaSubsampling: '4:4:4',
      effort: 6,
    })
    .toBuffer();
}

async function processImage(buffer: Buffer): Promise<{ url: string }> {
  try {
    const resizedBuffer = await sharp(buffer)
      .resize({
        width: 1920,
        height: 1080,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toBuffer();

    const avifBuffer = await convertirAAvif(resizedBuffer);

    const uploadPath = path.join(__dirname, '..', '..', 'public', 'uploads');
    const filename = `${uuidv4()}.avif`;
    const filePath = path.join(uploadPath, filename);
    const fileUrl = `/uploads/${filename}`;

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    fs.writeFileSync(filePath, avifBuffer);

    return { url: fileUrl };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al procesar la imagen en el worker: ${message}`);
  }
}

if (parentPort) {
  const data = workerData as WorkerData;
  processImage(data.buffer)
    .then((result) => {
      if (parentPort) {
        parentPort.postMessage({ status: 'done', ...result });
      }
    })
    .catch((error: Error) => {
      if (parentPort) {
        parentPort.postMessage({ status: 'error', message: error.message });
      }
    });
}
