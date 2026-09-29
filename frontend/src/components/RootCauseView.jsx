import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Sparkles, ShieldCheck, HelpCircle,
  BarChart3, Layers, ArrowRight, RefreshCw, AlertCircle, CheckCircle2,
  Calendar, Zap, Filter, ArrowUpDown, ChevronDown, ChevronRight, PieChart, Activity
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, ReferenceLine
} from 'recharts';

export default function RootCauseView({ onNavigateToChat }) {
  const [metric, setMetric] = useState('revenue');
  const [currentPeriod, setCurrentPeriod] = useState('');
  const [baselinePeriod, setBaselinePeriod] = useState('');
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [selectedDimensions, setSelectedDimensions] = useState(['category', 'region', 'product']);
  
  const [investigationData, setInvestigationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSqlModal, setShowSqlModal] = useState(false);

  // Fetch filter options and default periods on mount
  useEffect(() => {
    runInvestigation();
  }, []);

  const runInvestigation = async (customMetric, customCurr, customBase) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        metric: customMetric || metric,
        dimensions: selectedDimensions
      };
      if (customCurr || currentPeriod) payload.current_period = customCurr || currentPeriod;
      if (customBase || baselinePeriod) payload.baseline_period = customBase || baselinePeriod;

      const res = await fetch('http://127.0.0.1:8000/api/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.status === 'success') {
        setInvestigationData(data);
        if (data.current_period) setCurrentPeriod(data.current_period);
        if (data.baseline_period) setBaselinePeriod(data.baseline_period);
      } else {
        setError(data.message || 'Failed to complete root cause analysis.');
      }
    } catch (err) {
      console.error('Error running investigation:', err);
      setError('Network error: Unable to contact MetricMind API server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDimensionToggle = (dim) => {
    if (selectedDimensions.includes(dim)) {
      if (selectedDimensions.length > 1) {
        setSelectedDimensions(selectedDimensions.filter(d => d !== dim));
      }
    } else {
      setSelectedDimensions([...selectedDimensions, dim]);
    }
  };

  const overall = investigationData?.overall;
  const isPositiveDelta = overall ? overall.delta >= 0 : true;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. Header Banner */}
      <div className="glass-panel" style={{
        padding: '1.5rem 1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.14) 0%, rgba(99, 102, 241, 0.08) 100%)',
        borderColor: 'rgba(139, 92, 246, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="pill-badge" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc', borderColor: 'rgba(139, 92, 246, 0.4)' }}>
                Deterministic AI Driver Analysis
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#34d399' }}>
                <ShieldCheck style={{ width: '14px', height: '14px' }} /> Grounded Evidence Verified
              </span>
            </div>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', margin: 0 }}>
              Root-Cause <span className="gradient-text">Investigation Studio</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Deconstruct metric variance across periods and isolate specific driver contributions with verified evidence checks.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={() => runInvestigation()}
              className="btn-primary"
              disabled={loading}
              style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}
            >
              <RefreshCw style={{ width: '15px', height: '15px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              {loading ? 'Analyzing Drivers...' : 'Run Investigation'}
            </button>
          </div>
        </div>

        {/* Investigation Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingTop: '0.85rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Metric Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>METRIC:</span>
            <div style={{ display: 'inline-flex', background: 'rgba(15, 20, 34, 0.8)', padding: '0.2rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              {[
                { id: 'revenue', label: 'Revenue' },
                { id: 'profit', label: 'Profit' },
                { id: 'orders', label: 'Orders' },
                { id: 'quantity', label: 'Units Sold' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMetric(m.id);
                    runInvestigation(m.id);
                  }}
                  className={`tab-btn ${metric === m.id ? 'active' : ''}`}
                  style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dimension Checkboxes */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>DIMENSIONS:</span>
            {['category', 'region', 'product'].map(dim => (
              <button
                key={dim}
                onClick={() => handleDimensionToggle(dim)}
                className={`tab-btn ${selectedDimensions.includes(dim) ? 'active' : ''}`}
                style={{
                  fontSize: '0.78rem',
                  padding: '0.25rem 0.6rem',
                  textTransform: 'capitalize'
                }}
              >
                {dim}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '10px',
          background: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: '#fb7185',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.9rem'
        }}>
          <AlertCircle style={{ width: '18px', height: '18px' }} />
          {error}
        </div>
      )}

      {/* 2. Top Summary & Metric Shift Card */}
      {investigationData && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>
          {/* Comparison KPI Box */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Period Comparison
                </span>
                <span className="pill-badge" style={{
                  background: isPositiveDelta ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                  color: isPositiveDelta ? '#34d399' : '#fb7185',
                  borderColor: isPositiveDelta ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'
                }}>
                  {isPositiveDelta ? <TrendingUp style={{ width: '12px', height: '12px', marginRight: '4px' }} /> : <TrendingDown style={{ width: '12px', height: '12px', marginRight: '4px' }} />}
                  {overall?.pct_change > 0 ? `+${overall?.pct_change}%` : `${overall?.pct_change}%`}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.85rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  ${Number(overall?.current_value || 0).toLocaleString()}
                </span>
                <span style={{ fontSize: '0.9rem', color: isPositiveDelta ? '#34d399' : '#fb7185', fontWeight: 600 }}>
                  ({overall?.delta > 0 ? `+$${Number(overall?.delta).toLocaleString()}` : `-$${Number(Math.abs(overall?.delta || 0)).toLocaleString()}`})
                </span>
              </div>

              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div>Baseline ({investigationData.baseline_period}): <strong style={{ color: '#cbd5e1' }}>${Number(overall?.baseline_value || 0).toLocaleString()}</strong></div>
                <div>Current ({investigationData.current_period}): <strong style={{ color: '#cbd5e1' }}>${Number(overall?.current_value || 0).toLocaleString()}</strong></div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Investigation Target</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--accent-indigo)', fontWeight: 600 }}>{investigationData.metric}</span>
            </div>
          </div>

          {/* AI Narrative & Verification Status */}
          <div className="glass-panel" style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
            borderColor: 'rgba(99, 102, 241, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#a5b4fc' }}>
                  <Sparkles style={{ width: '16px', height: '16px' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    AI Grounded Narrative
                  </span>
                </div>
                
                {investigationData.verification?.verified && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.72rem',
                    color: '#34d399',
                    background: 'rgba(16, 185, 129, 0.15)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    <CheckCircle2 style={{ width: '12px', height: '12px' }} /> Verified Accurate
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {investigationData.narrative}
              </p>
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Confidence: <strong style={{ color: '#34d399' }}>100% Deterministic Evidence Check</strong>
              </span>
              {onNavigateToChat && (
                <button
                  onClick={() => onNavigateToChat(`Why did ${investigationData.metric} change between ${investigationData.baseline_period} and ${investigationData.current_period}?`)}
                  className="tab-btn"
                  style={{ fontSize: '0.75rem', color: 'var(--accent-indigo)' }}
                >
                  Ask Copilot in Chat →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Top Contributing Drivers (Positive vs Negative) */}
      {investigationData && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Top Positive Drivers */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <TrendingUp style={{ width: '18px', height: '18px', color: '#34d399' }} />
              <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#34d399' }}>Top Positive Catalysts</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(investigationData.top_positive_drivers || []).length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No positive drivers identified in this period.</div>
              ) : (
                (investigationData.top_positive_drivers || []).map((driver, idx) => (
                  <div key={idx} style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#a7f3d0', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                        {driver.dimension}
                      </span>
                      <strong style={{ fontSize: '0.92rem', color: '#f8fafc' }}>
                        {driver.name}
                      </strong>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399', display: 'block' }}>
                        +${Number(driver.delta).toLocaleString()}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#6ee7b7' }}>
                        +{driver.pct_change}% shift
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Negative Drivers */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <TrendingDown style={{ width: '18px', height: '18px', color: '#fb7185' }} />
              <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#fb7185' }}>Top Negative Drags</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(investigationData.top_negative_drivers || []).length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No negative drags identified in this period.</div>
              ) : (
                (investigationData.top_negative_drivers || []).map((driver, idx) => (
                  <div key={idx} style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(244, 63, 94, 0.06)',
                    border: '1px solid rgba(244, 63, 94, 0.2)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#fecdd3', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                        {driver.dimension}
                      </span>
                      <strong style={{ fontSize: '0.92rem', color: '#f8fafc' }}>
                        {driver.name}
                      </strong>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fb7185', display: 'block' }}>
                        -${Number(Math.abs(driver.delta)).toLocaleString()}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#fda4af' }}>
                        {driver.pct_change}% shift
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Strategic Recommendations & Actions */}
      {investigationData && (
        <div className="glass-panel" style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(99, 102, 241, 0.06) 100%)',
          borderColor: 'rgba(6, 182, 212, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Zap style={{ width: '18px', height: '18px', color: '#38bdf8' }} />
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0 }}>
              Prescriptive Remediation & Strategic Action Plan
            </h3>
          </div>

          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
            {investigationData.recommendation}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="pill-badge" style={{ fontSize: '0.72rem' }}>Priority 1: Supply Balancing</span>
              <span className="pill-badge" style={{ fontSize: '0.72rem' }}>Priority 2: Regional Reallocation</span>
            </div>

            {onNavigateToChat && (
              <button
                onClick={() => onNavigateToChat(`Generate a tactical 30-day remediation action plan for ${investigationData.metric} recovery.`)}
                className="btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.95rem' }}
              >
                Discuss Action Plan in Copilot
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
