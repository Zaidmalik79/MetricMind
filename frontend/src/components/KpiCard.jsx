import React from 'react';
import { TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';

export default function KpiCard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  color = 'indigo',
  isSelected = false,
  onClick,
  target,
  progress = 85
}) {
  const colorGradients = {
    indigo: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.05) 100%)',
    cyan: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0.05) 100%)',
    emerald: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)',
    purple: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.05) 100%)'
  };

  const borderColors = {
    indigo: '#6366f1',
    cyan: '#06b6d4',
    emerald: '#10b981',
    purple: '#8b5cf6'
  };

  const iconColors = {
    indigo: '#818cf8',
    cyan: '#38bdf8',
    emerald: '#34d399',
    purple: '#c084fc'
  };

  return (
    <div
      onClick={onClick}
      className="glass-panel glass-card-interactive"
      style={{
        padding: '1.25rem',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        border: isSelected
          ? `2px solid ${borderColors[color] || '#6366f1'}`
          : '1px solid var(--border-color)',
        boxShadow: isSelected
          ? `0 0 20px -3px ${borderColors[color]}44, 0 8px 24px 0 rgba(0,0,0,0.4)`
          : undefined,
        transform: isSelected ? 'translateY(-2px)' : undefined
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.85rem', color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600 }}>
            {title}
          </span>
          {isSelected && (
            <span style={{
              fontSize: '0.65rem',
              padding: '0.15rem 0.45rem',
              borderRadius: '999px',
              background: `${borderColors[color]}22`,
              color: borderColors[color],
              fontWeight: 700,
              textTransform: 'uppercase'
            }}>
              Active
            </span>
          )}
        </div>

        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: colorGradients[color] || colorGradients.indigo,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isSelected ? `0 0 10px ${borderColors[color]}33` : 'none'
        }}>
          {Icon && <Icon style={{ width: '20px', height: '20px', color: iconColors[color] }} />}
        </div>
      </div>

      {/* Main Metric Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
        <h2 style={{ fontSize: '1.65rem', color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>
          {value}
        </h2>
        {change && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: isPositive ? 'var(--accent-emerald)' : 'var(--accent-rose)'
          }}>
            {isPositive ? <TrendingUp style={{ width: '14px', height: '14px' }} /> : <TrendingDown style={{ width: '14px', height: '14px' }} />}
            {change}
          </div>
        )}
      </div>

      {/* Target Progress Bar */}
      {target && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <span>Target: {target}</span>
            <span>{Math.min(progress, 100)}%</span>
          </div>
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(progress, 100)}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${borderColors[color]}, ${iconColors[color]})`,
              borderRadius: '2px'
            }} />
          </div>
        </div>
      )}

      {/* Interactive Click Hint */}
      {onClick && (
        <div style={{
          position: 'absolute',
          bottom: '4px',
          right: '8px',
          fontSize: '0.65rem',
          color: 'rgba(255,255,255,0.25)',
          pointerEvents: 'none'
        }}>
          {isSelected ? '● Visualizing' : 'Click to view'}
        </div>
      )}
    </div>
  );
}
