const xlsx = require('xlsx');

/**
 * Parse uploaded Excel or CSV buffer into clean JSON records & sheet metadata
 * @param {Buffer} buffer 
 * @param {string} originalName 
 */
function parseExcelBuffer(buffer, originalName) {
  if (!buffer || buffer.length === 0) {
    throw new Error('Uploaded file buffer is empty');
  }

  // Read workbook from buffer
  const workbook = xlsx.read(buffer, {
    type: 'buffer',
    cellDates: true,
    raw: false,
    dateNF: 'yyyy-mm-dd',
  });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('No sheets found in spreadsheet');
  }

  const sheetNames = workbook.SheetNames;
  const primarySheetName = sheetNames[0];
  const worksheet = workbook.Sheets[primarySheetName];

  // Convert sheet to JSON rows
  const rawRows = xlsx.utils.sheet_to_json(worksheet, {
    defval: null,
    blankrows: false,
  });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('The spreadsheet contains no readable row data');
  }

  // Sanitize headers and object values
  const cleanedRows = rawRows.map((row) => {
    const cleanObj = {};
    Object.keys(row).forEach((key) => {
      const trimmedKey = String(key).trim();
      if (!trimmedKey || trimmedKey.startsWith('__EMPTY')) return;

      let val = row[key];
      if (typeof val === 'string') {
        val = val.trim();
        // Check if string is numeric
        if (val !== '' && !isNaN(val) && !isNaN(parseFloat(val))) {
          val = Number(val);
        }
      }
      cleanObj[trimmedKey] = val;
    });
    return cleanObj;
  }).filter(row => Object.keys(row).length > 0);

  return {
    fileName: originalName,
    sheetNames,
    activeSheet: primarySheetName,
    data: cleanedRows,
    rowCount: cleanedRows.length,
    columnCount: cleanedRows.length > 0 ? Object.keys(cleanedRows[0]).length : 0,
  };
}

module.exports = {
  parseExcelBuffer,
};
