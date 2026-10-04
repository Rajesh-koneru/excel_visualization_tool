import React, { useState, useMemo } from 'react';
import { Eye, Search, ArrowUpDown, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import download from 'downloadjs';

export const DataPreview = ({ PreviewData = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const rawRows = Array.isArray(PreviewData) ? PreviewData : [];
  const headers = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];

  // 1. Search Filter
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rawRows;
    const term = searchTerm.toLowerCase();
    return rawRows.filter((row) =>
      headers.some((h) => {
        const val = row[h];
        return val !== null && val !== undefined && String(val).toLowerCase().includes(term);
      })
    );
  }, [rawRows, headers, searchTerm]);

  // 2. Column Sorting
  const sortedRows = useMemo(() => {
    if (!sortColumn) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRows, sortColumn, sortDirection]);

  // 3. Pagination
  const totalPages = Math.ceil(sortedRows.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRows = sortedRows.slice(startIndex, startIndex + rowsPerPage);

  const handleSort = (col) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  // Export CSV Helper
  const handleExportCSV = () => {
    if (rawRows.length === 0) return;
    const csvHeaders = headers.join(',');
    const csvBody = rawRows
      .map((row) =>
        headers
          .map((h) => {
            const val = row[h] ?? '';
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(',')
      )
      .join('\n');

    const csvContent = `${csvHeaders}\n${csvBody}`;
    download(csvContent, 'dataset_export.csv', 'text/csv');
  };

  if (rawRows.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
        <Eye size={36} color="#4b5563" style={{ marginBottom: '12px' }} />
        <p style={{ fontSize: '15px', color: '#9ca3af', fontWeight: '600' }}>
          No Data Preview Available
        </p>
        <p style={{ fontSize: '13px', marginTop: '4px' }}>
          Upload an Excel or CSV file to explore data rows.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      {/* Header Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Eye size={22} color="#6366f1" />
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f3f4f6' }}>
            Interactive Dataset Explorer
          </h3>
          <span
            style={{
              fontSize: '12px',
              padding: '2px 10px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#a5b4fc',
              fontWeight: '600',
            }}
          >
            {sortedRows.length} Records
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Global Search Input */}
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              color="#9ca3af"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search dataset rows..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '8px 12px 8px 36px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '13px',
                width: '220px',
                outline: 'none',
              }}
            />
          </div>

          {/* CSV Export Button */}
          <button
            onClick={handleExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              color: '#34d399',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(16, 185, 129, 0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)')}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(15, 23, 42, 0.9)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '12px 14px', fontSize: '12px', color: '#6b7280', width: '50px' }}>#</th>
              {headers.map((h) => (
                <th
                  key={h}
                  onClick={() => handleSort(h)}
                  style={{
                    padding: '12px 16px',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: sortColumn === h ? '#818cf8' : '#e5e7eb',
                    cursor: 'pointer',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{h}</span>
                    <ArrowUpDown size={12} color={sortColumn === h ? '#818cf8' : '#6b7280'} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row, rIdx) => (
              <tr
                key={rIdx}
                style={{
                  background: rIdx % 2 === 0 ? 'rgba(15, 23, 42, 0.3)' : 'rgba(31, 41, 55, 0.2)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    rIdx % 2 === 0 ? 'rgba(15, 23, 42, 0.3)' : 'rgba(31, 41, 55, 0.2)')
                }
              >
                <td style={{ padding: '12px 14px', fontSize: '12px', color: '#6b7280' }}>
                  {startIndex + rIdx + 1}
                </td>
                {headers.map((h) => (
                  <td key={h} style={{ padding: '12px 16px', fontSize: '13px', color: '#f3f4f6', whiteSpace: 'nowrap' }}>
                    {row[h] === null || row[h] === undefined ? (
                      <span style={{ color: '#f59e0b', fontStyle: 'italic', fontSize: '12px' }}>[Null]</span>
                    ) : typeof row[h] === 'number' ? (
                      Number(row[h]).toLocaleString()
                    ) : (
                      String(row[h])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination & Controls Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '13px',
          color: '#9ca3af',
        }}
      >
        <div>
          Showing <strong>{startIndex + 1}</strong> to{' '}
          <strong>{Math.min(startIndex + rowsPerPage, sortedRows.length)}</strong> of{' '}
          <strong>{sortedRows.length}</strong> records
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: '4px 8px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '12px',
              }}
            >
              {[10, 25, 50, 100].map((num) => (
                <option key={num} value={num} style={{ background: '#111827' }}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 10px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '6px',
                color: '#ffffff',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.4 : 1,
              }}
            >
              <ChevronLeft size={16} />
            </button>

            <span style={{ fontWeight: '600', color: '#e5e7eb' }}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 10px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '6px',
                color: '#ffffff',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.4 : 1,
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPreview;
