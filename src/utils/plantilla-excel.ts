import * as ExcelJS from 'exceljs';
import { Paquete } from '../paquetes/entidades/paquete.entity';

export async function generarExcelDePaquete(paquete: Paquete): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Detalles del Paquete');

  // Estilo para títulos principales
  const titleStyle: Partial<ExcelJS.Style> = {
    font: { bold: true, size: 16, color: { argb: '0047AB' } },
    alignment: { vertical: 'middle', horizontal: 'center' }
  };

  // Estilo para encabezados
  const headerStyle: Partial<ExcelJS.Style> = {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D3D3D3' } },
    font: { bold: true, color: { argb: '000000' } },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };

  // Estilo para datos
  const dataStyle: Partial<ExcelJS.Style> = {
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };

  // --- ENCABEZADO PRINCIPAL ---
  const mainTitle = worksheet.addRow(['DETALLES DEL PAQUETE TURÍSTICO']);
  mainTitle.height = 30;
  worksheet.mergeCells('A1:H1');
  mainTitle.getCell(1).style = titleStyle;

  // --- INFORMACIÓN BÁSICA ---
  const infoRows = [
    ['ID:', paquete.id],
    ['Nombre del Paquete:', paquete.nombre_paquete],
    ['Duración (días):', paquete.duracion],
    ['Origen:', paquete.origen],
    ['Destino:', paquete.destino],
    ['Precio Base:', { formula: `"$"&TEXT(${paquete.precio_base},"#,##0.00")` }],
    ['Hotel:', paquete.hotel ? paquete.hotel.nombre : 'N/A'],
    ['Vuelo:', paquete.vuelo ? paquete.vuelo.nombre : 'N/A']
  ];

  infoRows.forEach((row, index) => {
    const currentRow = worksheet.addRow(row);
    currentRow.getCell(1).style = { ...headerStyle, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E6E6FA' } }};
    currentRow.getCell(2).style = dataStyle;
    
    // Formato especial para precio
    if (index === 5) {
      currentRow.getCell(2).numFmt = '"$"#,##0.00';
    }
  });

  // --- ITINERARIO ---
  if (paquete.itinerario && paquete.itinerario.length > 0) {
    // Espacio
    worksheet.addRow([]);
    
    // Título
    const itineraryTitle = worksheet.addRow(['ITINERARIO DETALLADO']);
    worksheet.mergeCells(`A${itineraryTitle.number}:H${itineraryTitle.number}`);
    itineraryTitle.getCell(1).style = titleStyle;

    // Encabezados de tabla
    const headers = worksheet.addRow(['Día', 'Descripción']);
    headers.eachCell(cell => {
      cell.style = headerStyle;
    });

    // Datos del itinerario
    paquete.itinerario.forEach(item => {
      const row = worksheet.addRow([item.dia, item.descripcion]);
      row.eachCell(cell => {
        cell.style = dataStyle;
      });
    });

    // Autoajustar columnas del itinerario
    worksheet.columns = [
      { key: 'dia', width: 10 },
      { key: 'descripcion', width: 70 }
    ];
  }

  // --- FOOTER ---
  const footerRow = worksheet.addRow([`Generado el: ${new Date().toLocaleDateString()}`]);
  worksheet.mergeCells(`A${footerRow.number}:H${footerRow.number}`);
  footerRow.getCell(1).style = {
    alignment: { horizontal: 'right' },
    font: { italic: true }
  };

  // Ajustes finales
  worksheet.properties.defaultRowHeight = 25;
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as Buffer;
}