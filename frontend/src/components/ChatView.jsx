import React, { useState, useEffect } from 'react';
import { Send, Sparkles, Code, BarChart2, Table as TableIcon, Check, Copy, Bot, User, HelpCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function ChatView({ initialPrompt, onClearInitialPrompt }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your MetricMind AI BI Assistant. Ask me any business question in plain English (e.g. "What is our total revenue?", "Show sales by region", "Top 5 products by sales").',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const SAMPLE_QUESTIONS = [
    "What is our total revenue?",
    "Show sales by region",
    "Top 5 products by sales",
    "Show monthly sales trend",
    "Show top customers"
  ];

  const handleSend = async (qText) => {
    const queryToRun = qText || question;
    if (!queryToRun.trim() || loading) return;

    const userMsg = {
      sender: 'user',
      text: queryToRun,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!qText) setQuestion('');
    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: queryToRun })
      });
      const data = await res.json();

      const aiMsg = {
        sender: 'ai',
        question: data.question,
        generated_sql: data.generated_sql,
        query_result: data.query_result,
        chart: data.chart,
        insight: data.insight,
        recommendation: data.recommendation,
        error: data.error,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          error: 'Failed to communicate with MetricMind backend API server.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', gap: '1rem' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Bot style={{ width: '24px', height: '24px', color: 'var(--accent-indigo)' }} />
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Conversational AI Analytics Agent</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Natural Language to PostgreSQL SQL + Dynamic Insights</span>
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="glass-panel" style={{
        flex: 1,
        padding: '1.5rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {msg.sender === 'ai' ? (
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px',
                  background: 'var(--accent-indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Sparkles style={{ width: '16px', height: '16px', color: '#fff' }} />
                </div>
              ) : (
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px',
                  background: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <User style={{ width: '16px', height: '16px', color: '#fff' }} />
                </div>
              )}
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {msg.sender === 'user' ? 'You' : 'MetricMind Agent'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{msg.timestamp}</span>
            </div>

            {/* Bubble */}
            <div style={{
              maxWidth: '85%',
              padding: '1rem 1.25rem',
              borderRadius: '14px',
              background: msg.sender === 'user'
                ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                : 'rgba(255, 255, 255, 0.04)',
              border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
              color: '#ffffff'
            }}>
              {msg.text && <p style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{msg.text}</p>}

              {msg.error && (
                <p style={{ color: 'var(--accent-rose)', fontSize: '0.9rem' }}>⚠️ {msg.error}</p>
              )}

              {/* Generated SQL Code Block */}
              {msg.generated_sql && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'rgba(0, 0, 0, 0.4)', padding: '0.4rem 0.75rem',
                    borderRadius: '8px 8px 0 0', border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Code style={{ width: '14px', height: '14px' }} /> Generated PostgreSQL Query
                    </span>
                    <button
                      onClick={() => copyToClipboard(msg.generated_sql, idx)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem' }}
                    >
                      {copiedIndex === idx ? <Check style={{ width: '14px', height: '14px', color: 'var(--accent-emerald)' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
                      {copiedIndex === idx ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#a5b4fc',
                    background: '#090d16', padding: '0.75rem 1rem', borderRadius: '0 0 8px 8px',
                    overflowX: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderTop: 'none'
                  }}>
                    {msg.generated_sql}
                  </pre>
                </div>
              )}

              {/* AI Insight Card */}
              {msg.insight && (
                <div style={{
                  marginTop: '0.75rem', padding: '0.85rem', borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.25)'
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>
                    💡 Executive Business Insight
                  </span>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '0.3rem', lineHeight: 1.5 }}>
                    {msg.insight}
                  </p>
                </div>
              )}

              {/* Chart Visualizer */}
              {msg.query_result && msg.query_result.length > 1 && (
                <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-indigo)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <BarChart2 style={{ width: '14px', height: '14px' }} /> Recommended Visual: {msg.chart || 'Chart'}
                    </span>
                  </div>
                  <div style={{ height: '200px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={msg.query_result}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey={Object.keys(msg.query_result[0])[0]} stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={{ background: '#0f1422', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                        <Bar dataKey={Object.keys(msg.query_result[0])[1] || Object.keys(msg.query_result[0])[0]} fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Data Table */}
              {msg.query_result && msg.query_result.length > 0 && (
                <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    <TableIcon style={{ width: '14px', height: '14px' }} /> Query Results ({msg.query_result.length} rows)
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.06)', textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {Object.keys(msg.query_result[0]).map((col, i) => (
                          <th key={i} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {msg.query_result.slice(0, 5).map((row, rIdx) => (
                        <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          {Object.values(row).map((val, cIdx) => (
                            <td key={cIdx} style={{ padding: '0.4rem 0.75rem', color: 'var(--text-primary)' }}>{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-indigo)' }}>
            <Sparkles style={{ width: '18px', height: '18px', animation: 'spin 1.5s linear infinite' }} />
            <span style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>MetricMind AI Agent is understanding intent and executing SQL...</span>
          </div>
        )}
      </div>

      {/* Quick Sample Questions Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', padding: '0.2rem 0' }}>
        <HelpCircle style={{ width: '16px', height: '16px', color: 'var(--text-muted)', flexShrink: 0 }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0 }}>Try asking:</span>
        {SAMPLE_QUESTIONS.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSend(sq)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              padding: '0.35rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-indigo)'; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '0.75rem' }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask any business question in plain language..."
          style={{
            flex: 1,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '0.85rem 1.25rem',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            outline: 'none',
            fontFamily: 'var(--font-sans)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent-indigo)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          <span>Send</span>
          <Send style={{ width: '16px', height: '16px' }} />
        </button>
      </form>
    </div>
  );
}
