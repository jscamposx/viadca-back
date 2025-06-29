const caracteres =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function generarCodigoUnico(longitud = 5): string {
  let resultado = '';
  for (let i = 0; i < longitud; i++) {
    const index = Math.floor(Math.random() * caracteres.length);
    resultado += caracteres[index];
  }
  return resultado;
}
