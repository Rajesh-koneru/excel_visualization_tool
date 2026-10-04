import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, BarChart3, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import FileUpload from '../components/FileUpload';
import DatasetOverview from '../components/DatasetOverview';
import DataQualityCard from '../components/DataQualityCard';
import InsightsSection from '../components/InsightsSection';
import ChartConfiguration from '../components/ChartConfig';
import ChartDisplay from '../components/ChartDisplay';
import DataPreview from '../components/DataPreview';
import AiAssistant from '../components/AiAssistant';
import Footer from '../components/Footer';

export const HomePage = () => {
  const navigate = useNavigate();
  const [activeDataset, setActiveDataset] = useState(null);
  const [activeFileName, setActiveFileName] = useState('');
  const [rawRows, setRawRows] = useState([]);
  const [chartConfig, setChartConfig] = useState(null);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleUploadSuccess = (response) => {
    if (response && response.data) {
      setRawRows(response.data);
    }
    if (response && response.dataset) {
      setActiveDataset(response.dataset);
      setActiveFileName(response.dataset.fileName || response.filename);
    } else if (response && response.filename) {
      setActiveFileName(response.filename);
    }
    // Smooth scroll down to analysis dashboard section
    const elem = document.getElementById('analysis-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      {/* Background Orbs */}
      <div
        className="glow-orb"
        style={{ top: '-100px', left: '-100px', width: '500px', height: '500px', background: 'rgba(99, 102, 241, 0.25)' }}
      />
      <div
        className="glow-orb"
        style={{ top: '400px', right: '-150px', width: '600px', height: '600px', background: 'rgba(6, 182, 212, 0.2)' }}
      />

      {/* Navbar */}
      <Navbar user={user} onLogout={handleLogout} activeDatasetName={activeFileName} />

      {/* Hero Section */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 24px 40px', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto 50px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '20px',
              color: '#a5b4fc',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '20px',
            }}
          >
            <Sparkles size={14} color="#818cf8" />
            <span>Next-Generation Excel Data Intelligence</span>
          </div>

          <h1
            style={{
              fontSize: '52px',
              fontWeight: '800',
              lineHeight: '1.15',
              letterSpacing: '-1px',
              marginBottom: '20px',
            }}
            className="gradient-text"
          >
            Transform Raw Spreadsheets into Actionable Insights & Charts
          </h1>

          <p style={{ fontSize: '18px', color: '#9ca3af', lineHeight: '1.6', marginBottom: '36px' }}>
            Upload any Excel file to automatically profile data quality, audit missing values, generate dynamic analytical insights, and render interactive custom visualizations in seconds.
          </p>

          {/* Formats Pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <span style={{ padding: '6px 14px', borderRadius: '20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', fontSize: '13px', color: '#e5e7eb' }}>
              📊 Excel <strong>.xlsx</strong>
            </span>
            <span style={{ padding: '6px 14px', borderRadius: '20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', fontSize: '13px', color: '#e5e7eb' }}>
              📁 Legacy Excel <strong>.xls</strong>
            </span>
            <span style={{ padding: '6px 14px', borderRadius: '20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', fontSize: '13px', color: '#e5e7eb' }}>
              📄 CSV Data <strong>.csv</strong>
            </span>
          </div>
        </div>

        {/* File Upload Hero Area */}
        <div style={{ maxWidth: '1000px', margin: '0 auto 60px' }}>
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Dynamic Analysis Dashboard Results Section */}
        {rawRows.length > 0 && (
          <div id="analysis-section" style={{ scrollMarginTop: '80px', marginBottom: '60px' }}>
            {/* Header Title */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#ffffff' }}>
                  Analysis & Visualization Dashboard
                </h2>
                <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '4px' }}>
                  Interactive findings for <strong>{activeFileName}</strong>
                </p>
              </div>

              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                }}
              >
                <span>Full Workspace Dashboard</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Overview Cards */}
            <DatasetOverview
              dataset={activeDataset}
              fileName={activeFileName}
              rowCount={rawRows.length}
              columnCount={rawRows.length > 0 ? Object.keys(rawRows[0]).length : 0}
            />

            {/* Data Quality & Cleaning */}
            <DataQualityCard
              dataset={activeDataset}
              fileName={activeFileName}
              onDataCleaned={(res) => {
                if (res && res.data) setRawRows(res.data);
                if (res && res.dataset) setActiveDataset(res.dataset);
              }}
            />

            {/* Dynamic Insights */}
            {activeDataset?.insights && <InsightsSection insights={activeDataset.insights} />}

            {/* Chart Configuration & Display */}
            <ChartConfiguration
              data={rawRows}
              dataset={activeDataset}
              onChartConfigChange={(config) => setChartConfig(config)}
            />

            <ChartDisplay chartConfig={chartConfig} />

            {/* Full Interactive Data Table */}
            <DataPreview PreviewData={rawRows} />

            {/* Floating AI Data Assistant */}
            <AiAssistant
              dataset={activeDataset}
              rawRows={rawRows}
              fileName={activeFileName}
            />
          </div>
        )}

        {/* Feature Cards Grid */}
        <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', marginBottom: '12px' }}>
            Engineered for Modern Data Teams
          </h2>
          <p style={{ fontSize: '15px', color: '#9ca3af' }}>
            Built on Node.js, Express, MongoDB, and React for maximum efficiency.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '60px',
          }}
        >
          <FeatureCard
            icon={<FileSpreadsheet size={28} color="#818cf8" />}
            title="Instant Parser"
            description="Parses complex multi-sheet Excel files & CSVs directly in memory with sanitization."
          />

          <FeatureCard
            icon={<ShieldCheck size={28} color="#10b981" />}
            title="Data Health Audit"
            description="Identifies missing values, duplicate rows, and calculates an overall data health score."
          />

          <FeatureCard
            icon={<Sparkles size={28} color="#06b6d4" />}
            title="Dynamic Insight Engine"
            description="Automatically generates textual insights, min/max ranges, and category distributions."
          />

          <FeatureCard
            icon={<BarChart3 size={28} color="#f59e0b" />}
            title="Smart Visualizations"
            description="Recommends optimal chart types (Bar, Line, Area, Pie) and provides dynamic customization."
          />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div
    className="glass-panel"
    style={{
      padding: '28px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}
  >
    <div
      style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </div>
    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f9fafb' }}>{title}</h3>
    <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.5' }}>{description}</p>
  </div>
);

export default HomePage;
