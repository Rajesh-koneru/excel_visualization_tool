/**
 * Insight Engine & Intelligent Chart Recommendation System
 * Generates dynamic textual insights and tailored chart recommendations from dataset profile.
 */

function generateInsightsAndRecommendations(profile, rowCount) {
  const insights = [];
  const recommendations = [];

  const { columns, quality } = profile;
  const numericCols = columns.filter((c) => c.type === 'numeric');
  const categoricalCols = columns.filter((c) => c.type === 'categorical');

  // 1. Data Quality Insights
  if (quality.healthScore >= 90) {
    insights.push({
      id: 'quality-excellent',
      category: 'highlight',
      title: 'High Dataset Quality',
      description: `Data health score is ${quality.healthScore}%. The spreadsheet has minimal missing values or duplicate records.`,
      metric: `${quality.healthScore}% Health`,
      severity: 'success',
    });
  } else if (quality.healthScore < 75) {
    insights.push({
      id: 'quality-warning',
      category: 'warning',
      title: 'Data Quality Attention Needed',
      description: `Data health score is ${quality.healthScore}%. Found ${quality.nullCells} missing values and ${quality.duplicateRows} duplicate rows.`,
      metric: `${quality.nullCells} Missing Cells`,
      severity: 'warning',
    });
  }

  if (quality.duplicateRows > 0) {
    insights.push({
      id: 'dup-rows',
      category: 'warning',
      title: 'Duplicate Records Detected',
      description: `Found ${quality.duplicateRows} identical rows out of ${rowCount} total rows (${((quality.duplicateRows / rowCount) * 100).toFixed(1)}%).`,
      metric: `${quality.duplicateRows} Duplicates`,
      severity: 'warning',
    });
  }

  // 2. Numeric Column Insights
  numericCols.forEach((col) => {
    if (col.max !== undefined && col.min !== undefined) {
      insights.push({
        id: `num-range-${col.name}`,
        category: 'highlight',
        title: `Value Range for ${col.name}`,
        description: `${col.name} ranges from a minimum of ${col.min.toLocaleString()} to a maximum of ${col.max.toLocaleString()} with an average of ${col.mean.toLocaleString()}.`,
        metric: `Avg: ${col.mean.toLocaleString()}`,
        severity: 'info',
      });
    }

    if (col.stdDev !== undefined && col.mean > 0 && col.stdDev / col.mean > 0.5) {
      insights.push({
        id: `num-var-${col.name}`,
        category: 'distribution',
        title: `High Variance in ${col.name}`,
        description: `${col.name} shows significant variation across records (Std Dev: ${col.stdDev.toLocaleString()}).`,
        metric: `StdDev: ${col.stdDev.toLocaleString()}`,
        severity: 'important',
      });
    }
  });

  // 3. Categorical Column Insights
  categoricalCols.forEach((col) => {
    if (col.topValues && col.topValues.length > 0) {
      const top = col.topValues[0];
      const pct = ((top.count / rowCount) * 100).toFixed(1);
      insights.push({
        id: `cat-dom-${col.name}`,
        category: 'distribution',
        title: `Dominant Value in ${col.name}`,
        description: `"${top.value}" is the most frequent entry in ${col.name}, representing ${pct}% of total records (${top.count} occurrences).`,
        metric: `${pct}% Share`,
        severity: 'info',
      });
    }
  });

  // 4. Intelligent Chart Recommendations
  // Recommendation A: Category vs Numeric -> Bar Chart
  if (categoricalCols.length > 0 && numericCols.length > 0) {
    const catCol = categoricalCols[0].name;
    const numCol = numericCols[0].name;
    recommendations.push({
      chartType: 'bar',
      title: `${numCol} by ${catCol}`,
      description: `Compares numerical values of ${numCol} across categories in ${catCol}.`,
      xAxis: catCol,
      yAxis: numCol,
      aggregation: 'sum',
    });
  }

  // Recommendation B: Category Distribution -> Doughnut or Pie
  const suitableForPie = categoricalCols.find(
    (c) => c.uniqueCount >= 2 && c.uniqueCount <= 8
  );
  if (suitableForPie) {
    recommendations.push({
      chartType: 'doughnut',
      title: `Distribution of ${suitableForPie.name}`,
      description: `Visualizes relative proportion of categories in ${suitableForPie.name}.`,
      xAxis: suitableForPie.name,
      yAxis: numericCols.length > 0 ? numericCols[0].name : suitableForPie.name,
      aggregation: 'count',
    });
  }

  // Recommendation C: Sequential / Trend -> Line or Area Chart
  if (numericCols.length >= 2) {
    recommendations.push({
      chartType: 'line',
      title: `${numericCols[1].name} Trend vs ${numericCols[0].name}`,
      description: `Displays trend comparison between ${numericCols[0].name} and ${numericCols[1].name}.`,
      xAxis: numericCols[0].name,
      yAxis: numericCols[1].name,
      aggregation: 'none',
    });

    recommendations.push({
      chartType: 'area',
      title: `Area Distribution: ${numericCols[0].name}`,
      description: `Filled area representation showing cumulative weight of ${numericCols[0].name}.`,
      xAxis: categoricalCols.length > 0 ? categoricalCols[0].name : numericCols[0].name,
      yAxis: numericCols[0].name,
      aggregation: 'none',
    });
  } else if (numericCols.length === 1 && categoricalCols.length > 0) {
    recommendations.push({
      chartType: 'area',
      title: `Volume of ${numericCols[0].name}`,
      description: `Area visualization for ${numericCols[0].name} grouped by ${categoricalCols[0].name}.`,
      xAxis: categoricalCols[0].name,
      yAxis: numericCols[0].name,
      aggregation: 'sum',
    });
  }

  return { insights, recommendations };
}

module.exports = {
  generateInsightsAndRecommendations,
};
