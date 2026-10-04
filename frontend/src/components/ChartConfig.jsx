import React, { useState, useEffect } from 'react';
import { Settings2, Sparkles } from 'lucide-react';

const CHART_TYPES = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'area', label: 'Area Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'doughnut', label: 'Doughnut Chart' },
];

const AGGREGATIONS = [
  { value: 'sum', label: 'Sum' },
  { value: 'mean', label: 'Average' },
  { value: 'count', label: 'Count Records' },
  { value: 'raw', label: 'Raw Data (No Aggregation)' },
];

export const ChartConfiguration = ({
  data,
  dataset,
  onChartConfigChange,
}) => {
  const [headers, setHeaders] = useState([]);
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [aggregation, setAggregation] = useState('sum');
  const [chartTitle, setChartTitle] = useState('');

  // Extract column headers
  useEffect(() => {
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      const keys = Object.keys(data[0]);
      setHeaders(keys);

      // Default smart picks if not selected yet
      if (!xAxis && keys.length > 0) {
        // Pick first categorical or first column
        setXAxis(keys[0]);
      }
      if (!yAxis && keys.length > 1) {
        // Pick first numeric column
        const numCol = keys.find((k) => typeof data[0][k] === 'number') || keys[1];
        setYAxis(numCol);
      }
    }
  }, [data]);

  // Apply automated chart recommendation
  const applyRecommendation = (rec) => {
    if (rec.chartType) setChartType(rec.chartType);
    if (rec.xAxis) setXAxis(rec.xAxis);
    if (rec.yAxis) setYAxis(rec.yAxis);
    if (rec.aggregation) setAggregation(rec.aggregation);
    if (rec.title) setChartTitle(rec.title);
  };

  // Recalculate Chart Data when controls change
  useEffect(() => {
    if (!data || data.length === 0 || !xAxis) return;

    let processedChartData = [];

    if (aggregation === 'raw' || !yAxis) {
      processedChartData = data
        .slice(0, 30)
        .map((row) => ({
          name: String(row[xAxis] ?? 'N/A'),
          value: yAxis ? parseFloat(row[yAxis]) || 0 : 1,
        }))
        .filter((item) => item.name);
    } else {
      // Group & Aggregate Data
      const groupMap = {};

      data.forEach((row) => {
        const xVal = String(row[xAxis] ?? 'N/A');
        const yVal = parseFloat(row[yAxis]) || 0;

        if (!groupMap[xVal]) {
          groupMap[xVal] = { sum: 0, count: 0, values: [] };
        }
        groupMap[xVal].sum += yVal;
        groupMap[xVal].count += 1;
        groupMap[xVal].values.push(yVal);
      });

      processedChartData = Object.keys(groupMap).map((key) => {
        const item = groupMap[key];
        let calculatedValue = item.sum;

        if (aggregation === 'mean') {
          calculatedValue = item.count > 0 ? item.sum / item.count : 0;
        } else if (aggregation === 'count') {
          calculatedValue = item.count;
        }

        return {
          name: key,
          value: Number(calculatedValue.toFixed(2)),
        };
      });

      // Sort top 20 categories for visual clarity
      processedChartData = processedChartData
        .sort((a, b) => b.value - a.value)
        .slice(0, 20);
    }

    if (onChartConfigChange) {
      onChartConfigChange({
        chartType,
        chartData: processedChartData,
        chartTitle: chartTitle || `${yAxis || 'Record Count'} by ${xAxis}`,
        xAxisLabel: xAxis,
        yAxisLabel: yAxis || 'Count',
        aggregation,
      });
    }
  }, [xAxis, yAxis, chartType, aggregation, chartTitle, data]);

  const recommendations = dataset?.chartRecommendations || [];

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings2 size={20} color="#818cf8" />
          <span>Interactive Chart Configuration</span>
        </h3>
      </div>

      {/* Intelligent Recommendations Toolbar */}
      {recommendations.length > 0 && (
        <div style={{ marginBottom: '20px', padding: '14px', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#a5b4fc', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="#818cf8" />
            <span>Recommended Visualizations (1-Click Apply)</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {recommendations.map((rec, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyRecommendation(rec)}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: '#e5e7eb',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#818cf8')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
              >
                ✨ {rec.title} ({rec.chartType.toUpperCase()})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Configuration Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Chart Title */}
        <div>
          <label style={labelStyle}>Custom Chart Title</label>
          <input
            type="text"
            placeholder="Auto-generated title..."
            value={chartTitle}
            onChange={(e) => setChartTitle(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Chart Type */}
        <div>
          <label style={labelStyle}>Chart Type</label>
          <select value={chartType} onChange={(e) => setChartType(e.target.value)} style={inputStyle}>
            {CHART_TYPES.map((t) => (
              <option key={t.value} value={t.value} style={{ background: '#111827', color: '#fff' }}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* X Axis */}
        <div>
          <label style={labelStyle}>X-Axis Column (Category)</label>
          <select value={xAxis} onChange={(e) => setXAxis(e.target.value)} style={inputStyle}>
            <option value="" style={{ background: '#111827' }}>Select X Axis</option>
            {headers.map((h) => (
              <option key={h} value={h} style={{ background: '#111827', color: '#fff' }}>
                {h}
              </option>
            ))}
          </select>
        </div>

        {/* Y Axis */}
        <div>
          <label style={labelStyle}>Y-Axis Column (Numeric Value)</label>
          <select value={yAxis} onChange={(e) => setYAxis(e.target.value)} style={inputStyle}>
            <option value="" style={{ background: '#111827' }}>Select Y Axis (Optional)</option>
            {headers.map((h) => (
              <option key={h} value={h} style={{ background: '#111827', color: '#fff' }}>
                {h}
              </option>
            ))}
          </select>
        </div>

        {/* Aggregation */}
        <div>
          <label style={labelStyle}>Data Aggregation</label>
          <select value={aggregation} onChange={(e) => setAggregation(e.target.value)} style={inputStyle}>
            {AGGREGATIONS.map((a) => (
              <option key={a.value} value={a.value} style={{ background: '#111827', color: '#fff' }}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '600',
  color: '#9ca3af',
  marginBottom: '6px',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  background: 'rgba(15, 23, 42, 0.6)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  outline: 'none',
};

export default ChartConfiguration;
