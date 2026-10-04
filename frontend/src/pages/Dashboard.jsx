import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/SideBar';
import FileUpload from '../components/FileUpload';
import DatasetOverview from '../components/DatasetOverview';
import DataQualityCard from '../components/DataQualityCard';
import InsightsSection from '../components/InsightsSection';
import ChartConfiguration from '../components/ChartConfig';
import ChartDisplay from '../components/ChartDisplay';
import DataPreview from '../components/DataPreview';
import AiAssistant from '../components/AiAssistant';
import Footer from '../components/Footer';

export const DashboardPage = () => {
  const [activeDataset, setActiveDataset] = useState(null);
  const [activeFileName, setActiveFileName] = useState('');
  const [rawRows, setRawRows] = useState([]);
  const [chartConfig, setChartConfig] = useState(null);
  const [showUploadZone, setShowUploadZone] = useState(true);

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
    setShowUploadZone(false);
  };

  const handleFileSelectFromSidebar = (res, fileName) => {
    if (res && res.Data) {
      setRawRows(res.Data);
    } else if (res && res.data) {
      setRawRows(res.data);
    }
    if (res && res.dataset) {
      setActiveDataset(res.dataset);
    } else {
      setActiveDataset(null);
    }
    setActiveFileName(fileName);
    setShowUploadZone(false);
  };

  const handleFileDeleteFromSidebar = (deletedName) => {
    if (activeFileName === deletedName) {
      setActiveFileName('');
      setRawRows([]);
      setActiveDataset(null);
      setShowUploadZone(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <Navbar user={user} onLogout={handleLogout} activeDatasetName={activeFileName} />

      {/* Main Workspace Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar Drawer */}
        <Sidebar
          activeFileName={activeFileName}
          onFileSelect={handleFileSelectFromSidebar}
          onFileDelete={handleFileDeleteFromSidebar}
          onNewUploadClick={() => setShowUploadZone(true)}
        />

        {/* Content Area */}
        <main
          style={{
            flex: 1,
            height: 'calc(100vh - 65px)',
            overflowY: 'auto',
            padding: '24px 32px',
          }}
        >
          {showUploadZone && (
            <div style={{ marginBottom: '24px' }}>
              <FileUpload onUploadSuccess={handleUploadSuccess} />
            </div>
          )}

          {rawRows.length > 0 ? (
            <div>
              {/* Overview Metrics */}
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

              {/* Chart Config */}
              <ChartConfiguration
                data={rawRows}
                dataset={activeDataset}
                onChartConfigChange={(config) => setChartConfig(config)}
              />

              {/* Chart Renderer */}
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
          ) : !showUploadZone ? (
            <div
              className="glass-panel"
              style={{
                padding: '48px',
                textAlign: 'center',
                maxWidth: '600px',
                margin: '60px auto',
              }}
            >
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#f3f4f6', marginBottom: '8px' }}>
                No Active Dataset Selected
              </h3>
              <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '20px' }}>
                Upload a spreadsheet or select a previously processed file from history to start analyzing.
              </p>
              <button
                onClick={() => setShowUploadZone(true)}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Upload File Now
              </button>
            </div>
          ) : null}

          <Footer />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
