/**
 * Automatic Data Profiling Engine for Spreadsheet Datasets
 * Analyzes dataset structure, column data types, statistical metrics, and quality metrics.
 */

function profileDataset(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      columns: [],
      quality: { totalCells: 0, nullCells: 0, duplicateRows: 0, emptyColumns: [], healthScore: 100 },
    };
  }

  const rowCount = rows.length;
  const headers = Object.keys(rows[0] || {});
  const columnCount = headers.length;
  const totalCells = rowCount * columnCount;

  let totalNullCells = 0;
  const emptyColumns = [];

  // Track duplicate rows
  const rowStrings = new Set();
  let duplicateRows = 0;
  rows.forEach((row) => {
    const str = JSON.stringify(row);
    if (rowStrings.has(str)) {
      duplicateRows++;
    } else {
      rowStrings.add(str);
    }
  });

  // Column profiling
  const columns = headers.map((colName) => {
    const values = rows.map((r) => r[colName]);
    const nonNullValues = values.filter(
      (v) => v !== null && v !== undefined && v !== '' && !Number.isNaN(v)
    );
    const missingCount = rowCount - nonNullValues.length;
    totalNullCells += missingCount;

    if (nonNullValues.length === 0) {
      emptyColumns.push(colName);
      return {
        name: colName,
        type: 'categorical',
        missingCount,
        uniqueCount: 0,
        topValues: [],
      };
    }

    // Determine type (numeric if >= 80% non-null values are numbers)
    const numericValues = nonNullValues
      .map((v) => (typeof v === 'number' ? v : parseFloat(v)))
      .filter((v) => typeof v === 'number' && !isNaN(v));

    const isNumeric = numericValues.length / nonNullValues.length >= 0.8;

    if (isNumeric) {
      const sorted = [...numericValues].sort((a, b) => a - b);
      const sum = sorted.reduce((acc, curr) => acc + curr, 0);
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      const mean = sum / sorted.length;

      // Median
      const mid = Math.floor(sorted.length / 2);
      const median =
        sorted.length % 2 !== 0
          ? sorted[mid]
          : (sorted[mid - 1] + sorted[mid]) / 2;

      // Standard Deviation
      const variance =
        sorted.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0) /
        sorted.length;
      const stdDev = Math.sqrt(variance);

      const uniqueSet = new Set(sorted);

      return {
        name: colName,
        type: 'numeric',
        missingCount,
        uniqueCount: uniqueSet.size,
        min: Number(min.toFixed(2)),
        max: Number(max.toFixed(2)),
        mean: Number(mean.toFixed(2)),
        median: Number(median.toFixed(2)),
        stdDev: Number(stdDev.toFixed(2)),
        sum: Number(sum.toFixed(2)),
      };
    } else {
      // Categorical profiling
      const freqMap = {};
      nonNullValues.forEach((val) => {
        const key = String(val);
        freqMap[key] = (freqMap[key] || 0) + 1;
      });

      const uniqueKeys = Object.keys(freqMap);
      const topValues = uniqueKeys
        .map((k) => ({ value: k, count: freqMap[k] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        name: colName,
        type: 'categorical',
        missingCount,
        uniqueCount: uniqueKeys.length,
        topValues,
      };
    }
  });

  // Calculate overall data health score (0 to 100)
  const nullPenalty = totalCells > 0 ? (totalNullCells / totalCells) * 40 : 0;
  const dupPenalty = rowCount > 0 ? (duplicateRows / rowCount) * 40 : 0;
  const emptyPenalty = columnCount > 0 ? (emptyColumns.length / columnCount) * 20 : 0;
  const healthScore = Math.max(0, Math.round(100 - (nullPenalty + dupPenalty + emptyPenalty)));

  return {
    columns,
    quality: {
      totalCells,
      nullCells: totalNullCells,
      duplicateRows,
      emptyColumns,
      healthScore,
    },
  };
}

module.exports = {
  profileDataset,
};
