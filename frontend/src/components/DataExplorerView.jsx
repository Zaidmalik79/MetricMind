import React, { useState, useEffect } from 'react';
import { Database, Table, RefreshCw, ChevronRight } from 'lucide-react';

export default function DataExplorerView() {
  const [selectedTable, setSelectedTable] = useState('sales');
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  const TABLES = ['sales', 'customer', 'products', 'category', 'region'];

  const fetchTableData = async (tName) => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/tables/${tName}?limit=20`);
      const data = await res.json();
      if (data.status === 'success') {
        setTableData(data.rows || []);
      }
    } catch (err) {
      console.error('Error fetching table data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableData(selectedTable);
  }, [selectedTable]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner */}
      <div className="glass-panel" style={{
        padding: '1.25rem 1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Database style={{ width: '24px', height: '24px', color: 'var(--accent-cyan)' }} />
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>PostgreSQL Semantic Schema Explorer</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Direct table inspector & sample dataset browser</span>
          </div>
        </div>

        <button onClick={() => fetchTableData(selectedTable)} className="btn-secondary" disabled={loading}>
          <RefreshCw style={{ width: '16px', height: '16px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem' }}>
        {/* Sidebar Table Selector */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Database Tables
          </span>
          {TABLES.map((tb) => (
            <button
              key={tb}
              onClick={() => setSelectedTable(tb)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                background: selectedTable === tb ? 'var(--accent-indigo)' : 'rgba(255,255,255,0.03)',
                color: selectedTable === tb ? '#fff' : 'var(--text-secondary)',
                fontWeight: selectedTable === tb ? 600 : 400,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Table style={{ width: '16px', height: '16px' }} />
                {tb}
              </span>
              <ChevronRight style={{ width: '14px', height: '14px', opacity: selectedTable === tb ? 1 : 0.4 }} />
            </button>
          ))}
        </div>

        {/* Data Table */}
        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', textTransform: 'capitalize' }}>Table: <span className="gradient-text">{selectedTable}</span></h3>
            <span className="pill-badge">{tableData.length} Records Loaded</span>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading table dataset...
            </div>
          ) : tableData.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No records found in this table.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.06)', textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {Object.keys(tableData[0]).map((col, i) => (
                    <th key={i} style={{ padding: '0.65rem 0.85rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {Object.values(row).map((val, cIdx) => (
                      <td key={cIdx} style={{ padding: '0.6rem 0.85rem', color: 'var(--text-primary)' }}>{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
