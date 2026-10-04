import React from 'react';
import { FileSpreadsheet } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(11, 15, 25, 0.8)',
        padding: '32px 24px',
        marginTop: '60px',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileSpreadsheet size={20} color="#818cf8" />
          <span style={{ fontSize: '16px', fontWeight: '700' }} className="gradient-text">
            Excel Visual Analyzer
          </span>
        </div>

        <p style={{ fontSize: '13px', color: '#9ca3af', maxWidth: '600px', lineHeight: '1.5' }}>
          Modern MERN-stack Excel Data Intelligence & Visualization Platform. Upload spreadsheets, automatically audit data quality, generate actionable statistical insights, and create interactive Recharts graphics.
        </p>

        <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#6b7280', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span>React 19 & Node.js Express</span>
          <span>•</span>
          <span>MongoDB & Mongoose</span>
          <span>•</span>
          <span>Recharts & XLSX Processing</span>
        </div>

        <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '8px' }}>
          &copy; {new Date().getFullYear()} Excel Visual Analyzer Pro. Built for production excellence.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
