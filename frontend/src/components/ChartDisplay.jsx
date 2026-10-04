import React, { useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { TrendingUp, BarChart2 } from 'lucide-react';
import Download from './Download';

const PALETTE = [
  '#6366f1',
  '#3b82f6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
  '#14b8a6',
];

export const ChartDisplay = ({
  chartConfig,
}) => {
  const chartRef = useRef(null);

  const {
    chartType = 'bar',
    chartData = [],
    chartTitle = '',
    xAxisLabel = '',
    yAxisLabel = '',
  } = chartConfig || {};

  const renderChart = () => {
    if (!chartData || chartData.length === 0) return null;

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, bottom: 60, left: 20 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, bottom: 60, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                angle={-30}
                textAnchor="end"
              />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{ fill: '#38bdf8', r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={380}>
            <AreaChart data={chartData} margin={{ top: 20, right: 30, bottom: 60, left: 20 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="url(#areaGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'doughnut':
        return (
          <ResponsiveContainer width="100%" height={380}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={380}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart2 size={20} color="#38bdf8" />
            <span>{chartTitle || 'Interactive Visualization Canvas'}</span>
          </h3>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
            Visualizing <strong>{yAxisLabel || 'Values'}</strong> grouped by <strong>{xAxisLabel || 'Category'}</strong>
          </p>
        </div>

        {/* Download Chart Export Dropdown */}
        {chartData.length > 0 && <Download chartRef={chartRef} />}
      </div>

      {/* Chart Canvas */}
      <div
        ref={chartRef}
        style={{
          background: 'rgba(11, 15, 25, 0.6)',
          borderRadius: '14px',
          padding: '20px 10px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {chartData.length > 0 ? (
          renderChart()
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
            <TrendingUp size={48} color="#4b5563" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#9ca3af' }}>
              No Data Available for Visualization
            </p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>
              Select valid X and Y columns in Chart Configuration to render graphs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'rgba(17, 24, 39, 0.95)',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          borderRadius: '8px',
          padding: '10px 14px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        }}
      >
        <p style={{ fontSize: '12px', color: '#a5b4fc', fontWeight: '700', marginBottom: '4px' }}>
          {label}
        </p>
        <p style={{ fontSize: '14px', color: '#ffffff', fontWeight: '600' }}>
          Value: {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default ChartDisplay;
