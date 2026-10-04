import React from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, PieChart } from 'lucide-react';

export const InsightsSection = ({ insights }) => {
  if (!insights || !Array.isArray(insights) || insights.length === 0) return null;

  const getIcon = (category) => {
    switch (category) {
      case 'distribution':
        return <PieChart size={18} color="#38bdf8" />;
      case 'warning':
        return <AlertTriangle size={18} color="#f59e0b" />;
      case 'trend':
        return <TrendingUp size={18} color="#10b981" />;
      default:
        return <Lightbulb size={18} color="#a78bfa" />;
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'warning':
        return { border: 'rgba(245, 158, 11, 0.3)', bg: 'rgba(245, 158, 11, 0.08)' };
      case 'success':
        return { border: 'rgba(16, 185, 129, 0.3)', bg: 'rgba(16, 185, 129, 0.08)' };
      case 'important':
        return { border: 'rgba(244, 63, 94, 0.3)', bg: 'rgba(244, 63, 94, 0.08)' };
      default:
        return { border: 'rgba(99, 102, 241, 0.3)', bg: 'rgba(99, 102, 241, 0.08)' };
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f3f4f6', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Lightbulb size={20} color="#a78bfa" />
        <span>Dynamic Data Insights & Key Discoveries</span>
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '14px',
        }}
      >
        {insights.map((item, idx) => {
          const style = getSeverityStyle(item.severity);
          return (
            <div
              key={idx}
              style={{
                padding: '16px 18px',
                borderRadius: '12px',
                background: style.bg,
                border: `1px solid ${style.border}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getIcon(item.category)}
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>
                      {item.title}
                    </span>
                  </div>
                  {item.metric && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#e5e7eb',
                      }}
                    >
                      {item.metric}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.5' }}>
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InsightsSection;
