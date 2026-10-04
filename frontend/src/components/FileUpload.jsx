import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { datasetService } from '../services/api';

export const FileUpload = ({ onUploadSuccess, onDemoTrigger }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusState, setStatusState] = useState('idle'); // idle | uploading | processing | success | error
  const [progressPercent, setProgressPercent] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const MAX_SIZE_MB = 10;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  const validateFile = (file) => {
    if (!file) return false;
    const name = file.name.toLowerCase();
    const isSupported = name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv');

    if (!isSupported) {
      setErrorMessage('Unsupported file format. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.');
      setStatusState('error');
      return false;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setErrorMessage(`File exceeds maximum size limit of ${MAX_SIZE_MB}MB.`);
      setStatusState('error');
      return false;
    }

    setErrorMessage('');
    return true;
  };

  const processUpload = async (file) => {
    if (!validateFile(file)) return;

    setSelectedFile(file);
    setStatusState('uploading');
    setProgressPercent(10);

    try {
      const res = await datasetService.uploadExcel(file, (pct) => {
        setProgressPercent(Math.min(pct, 90));
      });

      setStatusState('processing');
      setProgressPercent(100);

      setTimeout(() => {
        setStatusState('success');
        if (onUploadSuccess) {
          onUploadSuccess(res);
        }
      }, 500);
    } catch (err) {
      console.error('Upload Error:', err);
      setErrorMessage(err.message || 'Error processing Excel file. Please ensure spreadsheet is valid.');
      setStatusState('error');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processUpload(e.target.files[0]);
    }
  };

  const handleDemoClick = async () => {
    setStatusState('processing');
    try {
      const res = await datasetService.getDemoDataset();
      setStatusState('success');
      if (onUploadSuccess) {
        onUploadSuccess(res);
      }
    } catch (err) {
      setErrorMessage('Failed to load demo dataset.');
      setStatusState('error');
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#f9fafb', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileSpreadsheet size={22} color="#818cf8" />
            <span>Upload Excel File</span>
          </h2>
          <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
            Drag and drop your spreadsheet to parse, profile, and analyze data automatically.
          </p>
        </div>

        {/* Demo Button */}
        <button
          type="button"
          onClick={handleDemoClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            borderRadius: '10px',
            color: '#c7d2fe',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.25)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)')}
        >
          <Sparkles size={14} color="#a5b4fc" />
          <span>Try Demo Sales Dataset</span>
        </button>
      </div>

      {/* Dropzone Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${
            isDragOver
              ? '#6366f1'
              : statusState === 'success'
              ? '#10b981'
              : statusState === 'error'
              ? '#f43f5e'
              : 'rgba(255, 255, 255, 0.18)'
          }`,
          borderRadius: '14px',
          padding: '36px 20px',
          textAlign: 'center',
          backgroundColor: isDragOver
            ? 'rgba(99, 102, 241, 0.08)'
            : 'rgba(15, 23, 42, 0.5)',
          transition: 'all 0.25s ease',
          position: 'relative',
        }}
      >
        {statusState === 'uploading' || statusState === 'processing' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <Loader2 size={42} color="#818cf8" style={{ animation: 'spin 1.2s linear infinite' }} />
            <div>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#f3f4f6' }}>
                {statusState === 'uploading' ? 'Uploading Spreadsheet...' : 'Analyzing & Profiling Dataset...'}
              </p>
              <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
                Extracting columns, calculating statistics & generating insights...
              </p>
            </div>
            <div style={{ width: '100%', maxWidth: '320px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        ) : statusState === 'success' && selectedFile ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={44} color="#10b981" />
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#34d399' }}>
              Upload & Analysis Complete!
            </h4>
            <p style={{ fontSize: '14px', color: '#e5e7eb' }}>
              <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
            <label
              style={{
                marginTop: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#e5e7eb',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} />
              <span>Upload Another File</span>
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '4px',
              }}
            >
              <Upload size={28} color="#818cf8" />
            </div>

            <div>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#f3f4f6' }}>
                Drag and drop your Excel or CSV file here
              </p>
              <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
                Supports <strong>.xlsx</strong>, <strong>.xls</strong>, and <strong>.csv</strong> up to 10MB
              </p>
            </div>

            <label
              style={{
                marginTop: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <Upload size={16} />
              <span>Browse Files</span>
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          </div>
        )}
      </div>

      {/* Error Alert Banner */}
      {statusState === 'error' && errorMessage && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#fca5a5',
            fontSize: '13px',
          }}
        >
          <AlertTriangle size={18} color="#f43f5e" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
