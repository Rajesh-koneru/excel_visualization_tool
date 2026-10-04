import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, Trash2, History, Plus } from 'lucide-react';
import { datasetService } from '../services/api';

export const Sidebar = ({
  activeFileName,
  onFileSelect,
  onFileDelete,
  onNewUploadClick,
}) => {
  const [datasetsList, setDatasetsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmFile, setDeleteConfirmFile] = useState(null);

  const fetchFiles = async () => {
    try {
      const res = await datasetService.getFilesList();
      const list = res.datasets || (res.data || []).map((name) => ({ fileName: name }));
      setDatasetsList(list);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching datasets list:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [activeFileName]);

  const handleSelect = async (fileObj) => {
    const fileName = fileObj.fileName || fileObj;
    if (onFileSelect) {
      try {
        const res = await datasetService.getDataPreview(fileName);
        onFileSelect(res, fileName);
      } catch (err) {
        console.error('Failed to load selected file preview:', err);
      }
    }
  };

  const handleDelete = async (fileName) => {
    try {
      await datasetService.deleteDataset(fileName);
      setDatasetsList((prev) => prev.filter((d) => (d.fileName || d) !== fileName));
      setDeleteConfirmFile(null);
      if (onFileDelete) {
        onFileDelete(fileName);
      }
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  };

  return (
    <aside
      style={{
        width: '300px',
        background: 'rgba(11, 15, 25, 0.95)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 65px)',
        padding: '20px 16px',
        overflowY: 'auto',
      }}
    >
      {/* New File Upload Trigger Button */}
      <button
        onClick={onNewUploadClick}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          border: 'none',
          borderRadius: '12px',
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
          marginBottom: '20px',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        <Plus size={18} />
        <span>New Excel Upload</span>
      </button>

      {/* History Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '14px' }}>
        <History size={16} color="#818cf8" />
        <span>Analysis History ({datasetsList.length})</span>
      </div>

      {/* File List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading ? (
          <div style={{ fontSize: '13px', color: '#6b7280', padding: '12px 0' }}>
            Loading history...
          </div>
        ) : datasetsList.length === 0 ? (
          <div style={{ padding: '24px 12px', textAlign: 'center', color: '#6b7280', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <FileSpreadsheet size={32} color="#4b5563" style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '600' }}>No History Yet</p>
            <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
              Upload your first spreadsheet to visualize data.
            </p>
          </div>
        ) : (
          datasetsList.map((item, idx) => {
            const name = item.fileName || item;
            const isActive = activeFileName === name;

            return (
              <div
                key={idx}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${isActive ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => handleSelect(item)}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.25)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                  <FileSpreadsheet size={20} color={isActive ? '#818cf8' : '#34d399'} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: isActive ? '#ffffff' : '#e5e7eb', textOverflow: 'ellipsis', overflow: 'hidden', whitespace: 'nowrap' }}>
                      {name}
                    </div>
                    {item.rowCount && (
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                        {item.rowCount} rows • {item.healthScore || 100}% health
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmFile(name);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '6px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#f43f5e')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmFile && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div className="glass-panel" style={{ maxWidth: '380px', width: '100%', padding: '24px', textAlign: 'center' }}>
            <Trash2 size={36} color="#f43f5e" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '17px', fontWeight: '700', color: '#f3f4f6' }}>Delete Dataset?</h4>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '6px' }}>
              Are you sure you want to remove <strong>{deleteConfirmFile}</strong> from your analysis history?
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteConfirmFile(null)}
                style={{
                  padding: '8px 18px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: '#e5e7eb',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmFile)}
                style={{
                  padding: '8px 18px',
                  background: '#f43f5e',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
