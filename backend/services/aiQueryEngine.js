/**
 * Deterministic Query Engine for Spreadsheet Datasets
 * Performs accurate mathematical computations (MIN, MAX, SUM, AVG, COUNT, GROUP BY, RANKING)
 * directly against the processed dataset rows to ensure zero hallucination.
 */

function resolveDeterministicQuery(question, dataset, rows = []) {
  if (!question || typeof question !== 'string') {
    return { isDeterministic: false, intent: 'UNKNOWN' };
  }

  const q = question.toLowerCase().trim();
  const columns = dataset?.columns || [];
  const rowCount = rows.length > 0 ? rows.length : (dataset?.rowCount || 0);

  // If question is completely unrelated to data analysis
  const outOfScopePatterns = [
    /\b(who is the president|prime minister|capital of|weather in|tell me a joke|write a poem|movie|song)\b/i,
  ];
  for (const pattern of outOfScopePatterns) {
    if (pattern.test(q)) {
      return {
        isDeterministic: true,
        intent: 'OUT_OF_SCOPE',
        answer: "I am your Excel Data Assistant and can only answer questions about the uploaded dataset. Please ask a question related to your spreadsheet's columns, values, summaries, or trends.",
      };
    }
  }

  // 1. Overall Summary / Report Query
  if (
    q.includes('overall report') ||
    q.includes('summarize') ||
    q.includes('summary') ||
    q.includes('overview') ||
    q.includes('give me a report') ||
    q.includes('tell me about this data')
  ) {
    const numCols = columns.filter((c) => c.type === 'numeric');
    const catCols = columns.filter((c) => c.type === 'categorical');
    const quality = dataset?.quality || {};

    let summaryText = `Here is an overall executive report of **${dataset?.fileName || 'the uploaded spreadsheet'}**:\n\n`;
    summaryText += `• **Dataset Scale**: ${rowCount.toLocaleString()} records across ${columns.length} columns.\n`;
    summaryText += `• **Data Health Score**: ${quality.healthScore ?? 100}% (${quality.nullCells ?? 0} missing cells, ${quality.duplicateRows ?? 0} duplicates).\n`;

    if (numCols.length > 0) {
      summaryText += `• **Key Numerical Metrics**:\n`;
      numCols.slice(0, 4).forEach((col) => {
        summaryText += `  - **${col.name}**: Avg ${col.mean?.toLocaleString() || 0}, Range [${col.min?.toLocaleString() || 0} to ${col.max?.toLocaleString() || 0}], Total ${col.sum?.toLocaleString() || 0}\n`;
      });
    }

    if (catCols.length > 0) {
      summaryText += `• **Key Categorical Breakdowns**:\n`;
      catCols.slice(0, 3).forEach((col) => {
        const topVal = col.topValues?.[0]?.value || 'N/A';
        const topCount = col.topValues?.[0]?.count || 0;
        summaryText += `  - **${col.name}**: ${col.uniqueCount} distinct values (Top: "${topVal}" with ${topCount} occurrences)\n`;
      });
    }

    return {
      isDeterministic: true,
      intent: 'SUMMARY',
      answer: summaryText,
      facts: { rowCount, columnCount: columns.length, healthScore: quality.healthScore },
    };
  }

  // 2. Count / Total Rows Query
  if (
    q.includes('how many rows') ||
    q.includes('how many records') ||
    q.includes('number of rows') ||
    q.includes('number of records') ||
    q.includes('total rows') ||
    q.includes('total records')
  ) {
    return {
      isDeterministic: true,
      intent: 'COUNT',
      answer: `There are **${rowCount.toLocaleString()} records** (rows) and **${columns.length} columns** in this dataset.`,
      facts: { rowCount, columnCount: columns.length },
    };
  }

  // Find referenced columns
  const numericColumns = columns.filter((c) => c.type === 'numeric');
  const categoricalColumns = columns.filter((c) => c.type === 'categorical');

  // Match column from query
  let matchedNumCol = numericColumns.find((col) => q.includes(col.name.toLowerCase()));
  let matchedCatCol = categoricalColumns.find((col) => q.includes(col.name.toLowerCase()));

  // Fallback heuristic: "sales", "revenue", "profit", "units", "amount", "price", "cost"
  if (!matchedNumCol && numericColumns.length > 0) {
    const synonyms = ['sales', 'revenue', 'profit', 'units', 'amount', 'price', 'cost', 'score', 'salary', 'value'];
    for (const syn of synonyms) {
      if (q.includes(syn)) {
        matchedNumCol = numericColumns.find((c) => c.name.toLowerCase().includes(syn)) || numericColumns[0];
        break;
      }
    }
    // Default to first numeric column if question asks for highest/lowest/average value
    if (!matchedNumCol && (q.includes('highest') || q.includes('lowest') || q.includes('average') || q.includes('total'))) {
      matchedNumCol = numericColumns[0];
    }
  }

  // 3. Category Aggregation: e.g. "Which product has highest sales?", "Top 5 categories", "Compare regions"
  const isGrouping =
    q.startsWith('which ') ||
    q.includes(' which ') ||
    q.includes('breakdown') ||
    q.includes('compare ') ||
    q.includes('by category') ||
    q.includes('by region') ||
    q.includes('by product') ||
    (matchedCatCol && (q.includes('top ') || q.includes('best ')));

  if (isGrouping && rows.length > 0 && (matchedCatCol || categoricalColumns.length > 0)) {
    const catCol = matchedCatCol || categoricalColumns[0];
    const valCol = matchedNumCol || (numericColumns.length > 0 ? numericColumns[0] : null);

    if (catCol) {
      // Group by category and sum/count
      const groupMap = {};
      rows.forEach((row) => {
        const catKey = String(row[catCol.name] ?? 'Unknown');
        const numVal = valCol ? (parseFloat(row[valCol.name]) || 0) : 1;
        if (!groupMap[catKey]) groupMap[catKey] = 0;
        groupMap[catKey] += numVal;
      });

      const sortedGroups = Object.entries(groupMap)
        .map(([name, total]) => ({ name, total: Number(total.toFixed(2)) }))
        .sort((a, b) => b.total - a.total);

      if (sortedGroups.length > 0) {
        const top = sortedGroups[0];
        const valLabel = valCol ? valCol.name : 'Count';

        let response = `**${top.name}** has the highest ${valLabel} with **${top.total.toLocaleString()}**.\n\n`;
        response += `Top rankings for **${catCol.name}**:\n`;
        sortedGroups.slice(0, 5).forEach((item, idx) => {
          response += `${idx + 1}. **${item.name}**: ${item.total.toLocaleString()} ${valLabel}\n`;
        });

        return {
          isDeterministic: true,
          intent: 'GROUP_BY',
          facts: { categoryColumn: catCol.name, valueColumn: valCol?.name, topRanking: sortedGroups.slice(0, 5) },
          answer: response,
        };
      }
    }
  }

  // 4. MAX / HIGHEST
  if (
    q.includes('highest') ||
    q.includes('maximum') ||
    q.includes('max') ||
    q.includes('peak') ||
    q.includes('greatest') ||
    q.includes('most')
  ) {
    if (matchedNumCol) {
      // Find associated row with max value
      let maxVal = matchedNumCol.max;
      let associatedRecord = null;
      if (rows.length > 0) {
        const maxRow = rows.reduce((prev, curr) => {
          const currVal = parseFloat(curr[matchedNumCol.name]) || 0;
          const prevVal = parseFloat(prev[matchedNumCol.name]) || 0;
          return currVal > prevVal ? curr : prev;
        }, rows[0]);
        if (maxRow) {
          maxVal = maxRow[matchedNumCol.name];
          associatedRecord = maxRow;
        }
      }

      let answer = `The highest **${matchedNumCol.name}** value is **${maxVal?.toLocaleString() ?? maxVal}**.`;
      if (associatedRecord) {
        const otherFields = Object.entries(associatedRecord)
          .filter(([k]) => k !== matchedNumCol.name)
          .slice(0, 3)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
        if (otherFields) answer += ` (${otherFields})`;
      }

      return {
        isDeterministic: true,
        intent: 'MAX',
        facts: { column: matchedNumCol.name, value: maxVal, record: associatedRecord },
        answer,
      };
    }
  }

  // 5. MIN / LOWEST
  if (
    q.includes('lowest') ||
    q.includes('minimum') ||
    q.includes('min') ||
    q.includes('smallest') ||
    q.includes('least') ||
    q.includes('bottom')
  ) {
    if (matchedNumCol) {
      let minVal = matchedNumCol.min;
      let associatedRecord = null;
      if (rows.length > 0) {
        const minRow = rows.reduce((prev, curr) => {
          const currVal = parseFloat(curr[matchedNumCol.name]) || 0;
          const prevVal = parseFloat(prev[matchedNumCol.name]) || 0;
          return currVal < prevVal ? curr : prev;
        }, rows[0]);
        if (minRow) {
          minVal = minRow[matchedNumCol.name];
          associatedRecord = minRow;
        }
      }

      let answer = `The lowest **${matchedNumCol.name}** value is **${minVal?.toLocaleString() ?? minVal}**.`;
      if (associatedRecord) {
        const otherFields = Object.entries(associatedRecord)
          .filter(([k]) => k !== matchedNumCol.name)
          .slice(0, 3)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
        if (otherFields) answer += ` (${otherFields})`;
      }

      return {
        isDeterministic: true,
        intent: 'MIN',
        facts: { column: matchedNumCol.name, value: minVal, record: associatedRecord },
        answer,
      };
    }
  }

  // 6. AVERAGE / MEAN
  if (q.includes('average') || q.includes('mean') || q.includes('avg')) {
    if (matchedNumCol) {
      return {
        isDeterministic: true,
        intent: 'AVG',
        facts: { column: matchedNumCol.name, value: matchedNumCol.mean },
        answer: `The average **${matchedNumCol.name}** is **${matchedNumCol.mean?.toLocaleString() ?? matchedNumCol.mean}** (Std Dev: ${matchedNumCol.stdDev || 0}).`,
      };
    }
  }

  // 7. TOTAL / SUM
  if (q.includes('total') || q.includes('sum') || q.includes('overall revenue') || q.includes('all sales')) {
    if (matchedNumCol) {
      return {
        isDeterministic: true,
        intent: 'SUM',
        facts: { column: matchedNumCol.name, value: matchedNumCol.sum },
        answer: `The total cumulative **${matchedNumCol.name}** is **${matchedNumCol.sum?.toLocaleString() ?? matchedNumCol.sum}** across all ${rowCount.toLocaleString()} records.`,
      };
    }
  }

  // 8. Trends / Outliers / Anomalies
  if (q.includes('trend') || q.includes('outlier') || q.includes('anomal') || q.includes('unusual') || q.includes('insight')) {
    const insights = dataset?.insights || [];
    if (insights.length > 0) {
      let insightText = `Key insights and trends identified in this dataset:\n\n`;
      insights.slice(0, 4).forEach((ins) => {
        insightText += `• **${ins.title}**: ${ins.description}\n`;
      });
      return {
        isDeterministic: true,
        intent: 'INSIGHTS',
        facts: { insights },
        answer: insightText,
      };
    }
  }

  return { isDeterministic: false, intent: 'GENERAL_QUESTION' };
}

module.exports = {
  resolveDeterministicQuery,
};
