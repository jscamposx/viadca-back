import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { Paquete } from '../paquetes/entidades/paquete.entity';

export async function generarExcelDePaquete(paquete: Paquete): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Detalles del Paquete');

  const colors = {
    primary: '1E40AF',
    secondary: '3B82F6',
    light: 'EFF6FF',
    accent: '60A5FA',
    dark: '1E3A8A',
    white: 'FFFFFF',
    gray: 'F8FAFC',
  };

  try {
    const logoPath = path.join(__dirname, '..', 'assets', 'logo.png');

    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      const logoImageId = workbook.addImage({
        buffer: logoBuffer,
        extension: 'png',
      });
      worksheet.addImage(logoImageId, {
        tl: { col: 3, row: 1 },
        ext: { width: 180, height: 70 },
      });
    } else {
      console.log('❌ Logo NO encontrado en la ruta.');
    }
  } catch (error) {
    console.error('No se pudo cargar el logo:', error);
  }

  const titleStyle: Partial<ExcelJS.Style> = {
    font: {
      name: 'Segoe UI Semibold',
      size: 26,
      color: { argb: colors.primary },
    },
    alignment: { vertical: 'middle', horizontal: 'center' },
  };
  const sectionHeaderStyle: Partial<ExcelJS.Style> = {
    font: {
      name: 'Segoe UI Semibold',
      size: 16,
      color: { argb: colors.primary },
    },
    alignment: { vertical: 'middle', horizontal: 'left', indent: 1 },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: colors.light },
    },
    border: { bottom: { style: 'thin', color: { argb: colors.accent } } },
  };
  const labelStyle: Partial<ExcelJS.Style> = {
    font: { name: 'Segoe UI Semibold', color: { argb: colors.dark }, size: 11 },
    alignment: { vertical: 'middle', horizontal: 'left', indent: 1 },
    border: { bottom: { style: 'dotted', color: { argb: 'D1D5DB' } } },
  };
  const dataStyle: Partial<ExcelJS.Style> = {
    font: { name: 'Segoe UI', color: { argb: colors.dark }, size: 11 },
    alignment: { vertical: 'middle', horizontal: 'left', indent: 1 },
    border: { bottom: { style: 'dotted', color: { argb: 'D1D5DB' } } },
  };
  const priceLabelStyle: Partial<ExcelJS.Style> = {
    font: {
      name: 'Segoe UI Semibold',
      size: 14,
      color: { argb: colors.white },
    },
    alignment: { vertical: 'middle', horizontal: 'left', indent: 1 },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: colors.secondary },
    },
  };
  const priceValueStyle: Partial<ExcelJS.Style> = {
    font: { name: 'Segoe UI Black', size: 14, color: { argb: colors.white } },
    alignment: { vertical: 'middle', horizontal: 'right', indent: 1 },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: colors.secondary },
    },
    numFmt: '$#,##0.00',
  };

  worksheet.columns = [
    { width: 25 },
    { width: 50 },
    { width: 10 },
    { width: 15 },
    { width: 15 },
    { width: 2 },
  ];

  worksheet.mergeCells('D1:F1');

  worksheet.getCell('D1').alignment = {
    horizontal: 'right',
    vertical: 'middle',
  };
  worksheet.getCell('D1').font = {
    name: 'Segoe UI',
    color: { argb: colors.secondary },
    italic: true,
  };
  worksheet.getRow(1).height = 20;

  worksheet.getRow(3).height = 40;
  const mainTitle = worksheet.getCell('A3');
  mainTitle.value = paquete.nombre_paquete;
  mainTitle.style = titleStyle;
  worksheet.mergeCells('A3:F3');

  const priceRow = worksheet.getRow(5);
  priceRow.height = 35;
  priceRow.getCell('A').value = 'PRECIO TOTAL';
  priceRow.getCell('A').style = priceLabelStyle;
  priceRow.getCell('B').value = paquete.precio_base;
  priceRow.getCell('B').style = priceValueStyle;
  worksheet.mergeCells('B5:F5');

  let currentRowNum = 7;
  worksheet.getCell(`A${currentRowNum}`).value = 'INFORMACIÓN GENERAL';
  worksheet.getCell(`A${currentRowNum}`).style = sectionHeaderStyle;
  worksheet.mergeCells(`A${currentRowNum}:F${currentRowNum}`);
  worksheet.getRow(currentRowNum).height = 30;
  currentRowNum++;

  const infoRows = [
    ['📍 Origen', paquete.origen],
    ['🏁 Destino', paquete.destino],
    ['⏳ Duración', `${paquete.duracion} días`],
    ['🏨 Hotel', paquete.hotel ? paquete.hotel.nombre : 'No incluido'],
    ['✈️ Vuelo', paquete.vuelo ? paquete.vuelo.nombre : 'No incluido'],
  ];
  infoRows.forEach((rowData) => {
    const row = worksheet.getRow(currentRowNum++);
    row.height = 25;
    row.getCell('A').value = rowData[0];
    row.getCell('B').value = rowData[1];
    row.getCell('A').style = labelStyle;
    row.getCell('B').style = dataStyle;
  });

  if (paquete.itinerario && paquete.itinerario.length > 0) {
    currentRowNum++;
    worksheet.getCell(`A${currentRowNum}`).value = 'ITINERARIO DÍA A DÍA';
    worksheet.getCell(`A${currentRowNum}`).style = sectionHeaderStyle;
    worksheet.mergeCells(`A${currentRowNum}:F${currentRowNum}`);
    worksheet.getRow(currentRowNum).height = 30;
    currentRowNum++;
    paquete.itinerario.forEach((item, index) => {
      const row = worksheet.getRow(currentRowNum++);
      row.getCell('A').value = `Día ${item.dia}`;
      row.getCell('B').value = item.descripcion;
      row.getCell('A').style = labelStyle;
      row.getCell('B').style = {
        ...dataStyle,
        alignment: { ...dataStyle.alignment, wrapText: true },
      };
      if (index % 2 !== 0) {
        row.getCell('A').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: colors.gray },
        };
        row.getCell('B').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: colors.gray },
        };
      }
      const lineCount = Math.ceil((item.descripcion?.length || 0) / 45);
      row.height = Math.max(25, lineCount * 15);
      row.outlineLevel = 1;
    });
  }

  currentRowNum += 2;
  const footerCell = worksheet.getCell(`A${currentRowNum}`);
  footerCell.value = `Documento generado el ${new Date().toLocaleDateString('es-MX')}. Los precios y la disponibilidad están sujetos a cambios.`;
  worksheet.mergeCells(`A${currentRowNum}:F${currentRowNum}`);
  footerCell.style = {
    font: {
      name: 'Segoe UI',
      size: 9,
      italic: true,
      color: { argb: '757575' },
    },
    alignment: { horizontal: 'center', vertical: 'middle' },
  };
  worksheet.getRow(currentRowNum).height = 30;

  const endRow = currentRowNum;
  const borderStyle: ExcelJS.Border = {
    style: 'medium',
    color: { argb: colors.secondary },
  };
  for (let i = 1; i <= endRow; i++) {
    const row = worksheet.getRow(i);
    row.getCell('A').border = { ...row.getCell('A').border, left: borderStyle };
    row.getCell('F').border = {
      ...row.getCell('F').border,
      right: borderStyle,
    };
  }
  const topRow = worksheet.getRow(1);
  for (let col = 1; col <= 6; col++) {
    topRow.getCell(col).border = {
      ...topRow.getCell(col).border,
      top: borderStyle,
    };
  }
  const bottomRow = worksheet.getRow(endRow);
  for (let col = 1; col <= 6; col++) {
    bottomRow.getCell(col).border = {
      ...bottomRow.getCell(col).border,
      bottom: borderStyle,
    };
  }

  worksheet.pageSetup = {
    paperSize: 9,
    orientation: 'portrait',
    fitToPage: true,
    fitToHeight: 1,
    fitToWidth: 1,
  };
  worksheet.views = [
    {
      state: 'frozen',
      ySplit: 3,
      showGridLines: false,
      zoomScale: 90,
    },
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as Buffer;
}
