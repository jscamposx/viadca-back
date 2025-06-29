import * as sharp from 'sharp';

export async function convertirAAvif(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .toFormat('avif')
    .toBuffer();
}
