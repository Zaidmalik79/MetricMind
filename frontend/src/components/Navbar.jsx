import React from 'react';
import { LayoutDashboard, MessageSquareText, Database, ExternalLink, Sparkles, Activity } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 2rem',
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(99, 102, 241, 0.5)'
        }}>
          <Sparkles style={{ width: '22px', height: '22px', color: '#ffffff' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', margin: 0, lineHeight: 1.1 }}>
            Metric<span className="gradient-text">Mind</span>
          </h1>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            AGENTIC BI PLATFORM
          </span>
        </div>
      </div>

      {/* Nav Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '0.3rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'dashboard' ? 'var(--accent-indigo)' : 'transparent',
            color: activeTab === 'dashboard' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: activeTab === 'dashboard' ? 600 : 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <LayoutDashboard style={{ width: '16px', height: '16px' }} />
          Dashboard
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'chat' ? 'var(--accent-indigo)' : 'transparent',
            color: activeTab === 'chat' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: activeTab === 'chat' ? 600 : 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <MessageSquareText style={{ width: '16px', height: '16px' }} />
          AI BI Chat
        </button>

        <button
          onClick={() => setActiveTab('explorer')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'explorer' ? 'var(--accent-indigo)' : 'transparent',
            color: activeTab === 'explorer' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: activeTab === 'explorer' ? 600 : 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Database style={{ width: '16px', height: '16px' }} />
          Data Explorer
        </button>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.8rem',
          color: 'var(--accent-emerald)',
          background: 'rgba(16, 185, 129, 0.1)',
          padding: '0.35rem 0.75rem',
          borderRadius: '999px',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <Activity style={{ width: '14px', height: '14px' }} />
          API Connected
        </div>

        <a
          href="http://127.0.0.1:8000/docs"
          target="_blank"
          rel="noreferrer"
          className="btn-secondary"
          style={{ textDecoration: 'none', fontSize: '0.85rem' }}
        >
          API Docs <ExternalLink style={{ width: '14px', height: '14px' }} />
        </a>
      </div>
    </nav>
  );
}
