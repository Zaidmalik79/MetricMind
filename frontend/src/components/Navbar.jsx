import React from 'react';
import { LayoutDashboard, MessageSquareText, Database, ExternalLink, Sparkles, Activity, SearchCheck, HelpCircle, Settings } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.85rem 2rem',
      background: 'rgba(8, 11, 24, 0.9)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(99, 102, 241, 0.6)'
        }}>
          <Sparkles style={{ width: '20px', height: '20px', color: '#ffffff' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', margin: 0, lineHeight: 1.1, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Metric<span style={{ color: '#818cf8' }}>Mind</span>
          </h1>
        </div>
      </div>

      {/* Nav Tabs Centered Pill Container */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        background: 'rgba(15, 20, 36, 0.85)',
        padding: '0.25rem',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.45rem 1rem',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'dashboard' ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' : 'transparent',
            color: activeTab === 'dashboard' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: activeTab === 'dashboard' ? 600 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'dashboard' ? '0 2px 12px rgba(99, 102, 241, 0.4)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <LayoutDashboard style={{ width: '15px', height: '15px' }} />
          Dashboard
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.45rem 1rem',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'chat' ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' : 'transparent',
            color: activeTab === 'chat' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: activeTab === 'chat' ? 600 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'chat' ? '0 2px 12px rgba(99, 102, 241, 0.4)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <MessageSquareText style={{ width: '15px', height: '15px' }} />
          AI Chat
        </button>

        <button
          onClick={() => setActiveTab('rootcause')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.45rem 1rem',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'rootcause' ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' : 'transparent',
            color: activeTab === 'rootcause' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: activeTab === 'rootcause' ? 600 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'rootcause' ? '0 2px 12px rgba(99, 102, 241, 0.4)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <SearchCheck style={{ width: '15px', height: '15px' }} />
          Root-Cause RCA
        </button>

        <button
          onClick={() => setActiveTab('explorer')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.45rem 1rem',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'explorer' ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' : 'transparent',
            color: activeTab === 'explorer' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: activeTab === 'explorer' ? 600 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'explorer' ? '0 2px 12px rgba(99, 102, 241, 0.4)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Database style={{ width: '15px', height: '15px' }} />
          Data Explorer
        </button>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          className="btn-secondary"
          style={{ padding: '0.45rem', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }}
          title="Help & Documentation"
        >
          <HelpCircle style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
        </button>

        <button
          className="btn-secondary"
          style={{ padding: '0.45rem', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }}
          title="Settings"
        >
          <Settings style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
        </button>

        {/* User Profile Avatar */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '0.85rem',
          boxShadow: '0 0 10px rgba(99, 102, 241, 0.4)',
          cursor: 'pointer'
        }}>
          M
        </div>
      </div>
    </nav>
  );
}
