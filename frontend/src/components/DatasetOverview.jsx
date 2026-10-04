import React from 'react';
import { Database, FileText, Layers, ShieldCheck } from 'lucide-react';

export const DatasetOverview = ({ dataset, fileName, rowCount, columnCount }) => {
  if (!dataset && !rowCount) return null;

  const quality = dataset?.quality || {
    healthScore: 100,
    nullCells: 0,
    duplicateRows: 0,
    emptyColumns: [],
  };

  const columns = dataset?.columns || [];
  const rows = dataset?.rowCount || rowCount || 0;
  const cols = dataset?.columnCount || columnCount || 0;
  const fileSizeStr = dataset?.fileSize
    ? `${(dataset.fileSize / 1024).toFixed(1)} KB`
    : 'N/A';

  const healthColor =
    quality.healthScore >= 90
      ? '#10b981'
      : quality.healthScore >= 75
      ? '#f59e0b'
      : '#f43f5e';

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <MetricCard
          icon={<FileText size={20} color="#818cf8" />}
          label="Total Records"
          value={rows.toLocaleString()}
          subtext="Processed rows"
        />

        <MetricCard
          icon={<Layers size={20} color="#38bdf8" />}
          label="Total Columns"
          value={cols.toLocaleString()}
          subtext="Analyzed attributes"
        />

        <MetricCard
          icon={<Database size={20} color="#a78bfa" />}
          label="File Size"
          value={fileSizeStr}
          subtext={fileName || 'Spreadsheet'}
        />

        <MetricCard
          icon={<ShieldCheck size={20} color={healthColor} />}
          label="Data Health Score"
          value={`${quality.healthScore}%`}
          subtext={quality.nullCells > 0 ? `${quality.nullCells} missing values` : 'Clean data'}
          valueColor={healthColor}
        />
      </div>

      {/* Column Type Breakdown */}
      {columns.length > 0 && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f3f4f6', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#818cf8" />
            <span>Column Schema & Statistical Metrics</span>
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '12px',
            }}
          >
            {columns.map((col, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                    {col.name}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      background:
                        col.type === 'numeric'
                          ? 'rgba(56, 189, 248, 0.15)'
                          : 'rgba(167, 139, 250, 0.15)',
                      color: col.type === 'numeric' ? '#38bdf8' : '#a78bfa',
                    }}
                  >
                    {col.type}
                  </span>
                </div>

                {col.type === 'numeric' ? (
                  <div style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <span>Min: <strong style={{ color: '#e5e7eb' }}>{col.min}</strong></span>
                    <span>Max: <strong style={{ color: '#e5e7eb' }}>{col.max}</strong></span>
                    <span>Avg: <strong style={{ color: '#e5e7eb' }}>{col.mean}</strong></span>
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    <span>Unique values: <strong style={{ color: '#e5e7eb' }}>{col.uniqueCount}</strong></span>
                    {col.topValues && col.topValues.length > 0 && (
                      <span style={{ marginLeft: '10px' }}>
                        Top: <strong style={{ color: '#e5e7eb' }}>{col.topValues[0].value}</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ icon, label, value, subtext, valueColor }) => (
  <div
    className="glass-panel"
    style={{
      padding: '18px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    }}
  >
    <div
      style={{
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: '800', color: valueColor || '#f9fafb', marginTop: '2px' }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{subtext}</div>
    </div>
  </div>
);

export default DatasetOverview;
