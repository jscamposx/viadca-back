import * as sharp from 'sharp';

export async function convertirAAvif(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .avif({
      quality: 70,
      chromaSubsampling: '4:4:4',
      effort: 6,
    })
    .toBuffer();
}
