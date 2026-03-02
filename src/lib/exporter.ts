import ExcelJS from 'exceljs'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export async function generateExcelBuffer(columns: string[], rows: Array<Record<string, any>>) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Export')

  sheet.addRow(columns)

  rows.forEach(row => {
    const values = columns.map(col => (row[col] !== undefined && row[col] !== null) ? String(row[col]) : '')
    sheet.addRow(values)
  })

  // Auto width
  sheet.columns.forEach(column => {
    let max = 10
    column.eachCell({ includeEmpty: true }, cell => {
      const len = cell.value ? String(cell.value).length : 0
      if (len > max) max = len
    })
    column.width = Math.min(50, max + 2)
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

export async function generatePdfBuffer(columns: string[], rows: Array<Record<string, any>>) {
  const pdfDoc = await PDFDocument.create()
  let page = pdfDoc.addPage([595, 842]) // A4 in points
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const titleSize = 16
  const fontSize = 10
  const margin = 40
  const availableWidth = page.getWidth() - margin * 2
  const startY = page.getHeight() - margin
  let y = startY

  // Title
  page.drawText('Export', { x: margin, y: y, size: titleSize, font: helvetica })
  y -= titleSize + 8

  // Table header
  const colWidth = Math.floor(availableWidth / Math.max(1, columns.length))
  columns.forEach((col, i) => {
    page.drawText(String(col), { x: margin + i * colWidth, y, size: fontSize, font: helvetica, color: rgb(0, 0, 0) })
  })
  y -= fontSize + 6

  for (const row of rows) {
    for (let i = 0; i < columns.length; i++) {
      const text = row[columns[i]] !== undefined && row[columns[i]] !== null ? String(row[columns[i]]) : ''
      page.drawText(text, { x: margin + i * colWidth, y, size: fontSize, font: helvetica })
    }
    y -= fontSize + 6

    if (y < margin + 40) {
      page = pdfDoc.addPage([595, 842])
      y = startY
    }
  }

  const bytes = await pdfDoc.save()
  return Buffer.from(bytes)
}
