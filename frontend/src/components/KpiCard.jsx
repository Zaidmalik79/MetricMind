import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
  progress = 100,
  showSparkline = true
}) {
  const colorThemes = {
    indigo: {
      bg: 'rgba(99, 102, 241, 0.12)',
      border: 'rgba(99, 102, 241, 0.4)',
      activeBorder: '#3b82f6',
      iconBg: '#2563eb',
      iconColor: '#ffffff',
      sparklineColor: '#3b82f6',
      barGrad: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
      glow: 'rgba(59, 130, 246, 0.25)'
    },
    emerald: {
      bg: 'rgba(16, 185, 129, 0.08)',
      border: 'rgba(16, 185, 129, 0.3)',
      activeBorder: '#10b981',
      iconBg: '#059669',
      iconColor: '#ffffff',
      sparklineColor: '#10b981',
      barGrad: 'linear-gradient(90deg, #10b981, #34d399)',
      glow: 'rgba(16, 185, 129, 0.25)'
    },
    cyan: {
      bg: 'rgba(6, 182, 212, 0.08)',
      border: 'rgba(6, 182, 212, 0.3)',
      activeBorder: '#06b6d4',
      iconBg: '#0891b2',
      iconColor: '#ffffff',
      sparklineColor: '#06b6d4',
      barGrad: 'linear-gradient(90deg, #06b6d4, #38bdf8)',
      glow: 'rgba(6, 182, 212, 0.25)'
    },
    purple: {
      bg: 'rgba(168, 85, 247, 0.08)',
      border: 'rgba(168, 85, 247, 0.3)',
      activeBorder: '#a855f7',
      iconBg: '#7c3aed',
      iconColor: '#ffffff',
      sparklineColor: '#a855f7',
      barGrad: 'linear-gradient(90deg, #a855f7, #c084fc)',
      glow: 'rgba(168, 85, 247, 0.25)'
    }
  };

  const theme = colorThemes[color] || colorThemes.indigo;

  return (
    <div
      onClick={onClick}
      className="glass-panel glass-card-interactive"
      style={{
        padding: '1.2rem 1.35rem',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        background: isSelected ? 'rgba(18, 24, 48, 0.9)' : 'rgba(12, 16, 32, 0.75)',
        border: isSelected ? `1.5px solid ${theme.activeBorder}` : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: isSelected ? `0 0 25px -4px ${theme.glow}, 0 10px 30px rgba(0,0,0,0.5)` : '0 8px 25px rgba(0,0,0,0.3)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '160px'
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: theme.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 2px 10px ${theme.glow}`
          }}>
            {Icon && <Icon style={{ width: '16px', height: '16px', color: '#ffffff' }} />}
          </div>
          <span style={{ fontSize: '0.88rem', color: '#cbd5e1', fontWeight: 600 }}>
            {title}
          </span>
          {isSelected && (
            <span style={{
              fontSize: '0.62rem',
              padding: '0.15rem 0.45rem',
              borderRadius: '999px',
              background: 'rgba(99, 102, 241, 0.3)',
              color: '#a5b4fc',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              ACTIVE
            </span>
          )}
        </div>

        {/* Mini Wave Graphic Sparkline */}
        {showSparkline && (
          <svg width="60" height="24" viewBox="0 0 60 24" fill="none" style={{ opacity: 0.85 }}>
            <path
              d={
                color === 'indigo'
                  ? 'M2 18 C 15 12, 30 22, 45 6 C 52 2, 56 8, 58 4'
                  : color === 'emerald'
                  ? 'M2 20 C 15 16, 28 8, 42 12 C 50 4, 55 6, 58 3'
                  : color === 'cyan'
                  ? 'M2 19 C 18 19, 32 14, 44 8 C 50 4, 55 5, 58 2'
                  : 'M2 20 C 14 18, 25 10, 38 12 C 48 5, 54 8, 58 3'
              }
              stroke={theme.sparklineColor}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d={
                color === 'indigo'
                  ? 'M2 18 C 15 12, 30 22, 45 6 C 52 2, 56 8, 58 4 L 58 24 L 2 24 Z'
                  : color === 'emerald'
                  ? 'M2 20 C 15 16, 28 8, 42 12 C 50 4, 55 6, 58 3 L 58 24 L 2 24 Z'
                  : color === 'cyan'
                  ? 'M2 19 C 18 19, 32 14, 44 8 C 50 4, 55 5, 58 2 L 58 24 L 2 24 Z'
                  : 'M2 20 C 14 18, 25 10, 38 12 C 48 5, 54 8, 58 3 L 58 24 L 2 24 Z'
              }
              fill={theme.sparklineColor}
              fillOpacity="0.15"
            />
          </svg>
        )}
      </div>

      {/* Main Metric Value */}
      <div style={{ margin: '0.4rem 0 0.6rem 0' }}>
        <h2 style={{ fontSize: '1.75rem', color: '#ffffff', margin: 0, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {value}
        </h2>
      </div>

      {/* Target & Change Row */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.45rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            Target: {target || '$6.0B'}
          </span>
          {change && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
              fontWeight: 600,
              color: isPositive ? '#34d399' : '#fb7185'
            }}>
              <span>↑</span>
              <span>{change}</span>
            </div>
          )}
        </div>

        {/* Progress Bar with 100% badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(progress, 100)}%`,
              height: '100%',
              background: theme.barGrad,
              borderRadius: '2px'
            }} />
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}
