import * as sharp from 'sharp';

export async function convertirAAvif(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .avif({
      quality: 70,          // calidad de 0 a 100 (valor más bajo = menor tamaño y calidad)
      chromaSubsampling: '4:4:4', // controla submuestreo de color, '4:2:0' es más comprimido pero peor color
      effort: 6,            // esfuerzo de compresión 0 (rápido) a 9 (lento, mejor compresión)
    })
    .toBuffer();
}
