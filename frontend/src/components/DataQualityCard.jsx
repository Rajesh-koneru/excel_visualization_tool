import React, { useState } from 'react';
import { Sparkles, Check, AlertTriangle, RefreshCw } from 'lucide-react';
import { datasetService } from '../services/api';

export const DataQualityCard = ({ dataset, fileName, onDataCleaned }) => {
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanedMsg, setCleanedMsg] = useState('');

  if (!dataset || !dataset.quality) return null;

  const { nullCells, duplicateRows, emptyColumns } = dataset.quality;

  const handleClean = async () => {
    if (!fileName) return;
    setIsCleaning(true);
    setCleanedMsg('');
    try {
      const res = await datasetService.cleanDataset(fileName, {
        fillMissing: true,
        removeDuplicates: true,
      });
      setIsCleaning(false);
      setCleanedMsg('Dataset successfully cleaned! Missing values imputed & duplicates removed.');
      if (onDataCleaned) {
        onDataCleaned(res);
      }
    } catch (err) {
      setIsCleaning(false);
      setCleanedMsg('Error cleaning dataset: ' + err.message);
    }
  };

  const hasIssues = nullCells > 0 || duplicateRows > 0 || (emptyColumns && emptyColumns.length > 0);

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        marginBottom: '24px',
        borderLeft: `4px solid ${hasIssues ? '#f59e0b' : '#10b981'}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: hasIssues ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {hasIssues ? (
              <AlertTriangle size={24} color="#f59e0b" />
            ) : (
              <Check size={24} color="#10b981" />
            )}
          </div>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f9fafb' }}>
              Data Health & Quality Audit
            </h3>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '2px' }}>
              {hasIssues
                ? `Identified ${nullCells} missing values and ${duplicateRows} duplicate rows.`
                : 'No data quality anomalies detected in dataset.'}
            </p>
          </div>
        </div>

        {hasIssues && (
          <button
            onClick={handleClean}
            disabled={isCleaning}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '700',
              cursor: isCleaning ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            {isCleaning ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            <span>{isCleaning ? 'Cleaning Data...' : 'Auto-Clean Dataset'}</span>
          </button>
        )}
      </div>

      {cleanedMsg && (
        <div
          style={{
            marginTop: '16px',
            padding: '10px 14px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            color: '#6ee7b7',
            fontSize: '13px',
          }}
        >
          {cleanedMsg}
        </div>
      )}
    </div>
  );
};

export default DataQualityCard;
