import React, { useState, useEffect, useMemo, useRef } from 'react';
import KpiCard from './KpiCard';
import {
  DollarSign, ShoppingBag, Users, CreditCard, Sparkles, Filter, RefreshCw,
  TrendingUp, TrendingDown, Download, BarChart3, LineChart as LineIcon,
  PieChart as PieIcon, Layers, Search, ArrowUpDown, ChevronDown, Check,
  X, HelpCircle, ArrowRight, Zap, Eye, Calendar, MapPin, Tag, Activity
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine,
  Legend
} from 'recharts';

export default function DashboardView({ onNavigateToChat, onNavigateToRootCause }) {
  // Filter States
  const [regionFilter, setRegionFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [timeframeFilter, setTimeframeFilter] = useState('All Time');
  
  // Interactive View States
  const [activeMetric, setActiveMetric] = useState('revenue'); // 'revenue' | 'profit' | 'orders' | 'margin'
  const [chartType, setChartType] = useState('area'); // 'area' | 'bar' | 'line' | 'dual'
  const [showTarget, setShowTarget] = useState(true);
  
  // Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    regions: [],
    categories: [],
    timeframes: ['All Time', 'Q1', 'Q2', 'Q3', 'Q4', 'H1', 'H2']
  });
  const [loading, setLoading] = useState(true);
  const [hoveredSlice, setHoveredSlice] = useState(null);

  // Table States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('revenue');
  const [sortAsc, setSortAsc] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  // Auto-refresh timer state
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [countdown, setCountdown] = useState(30);

  // Drilldown modal for specific month
  const [drilldownMonth, setDrilldownMonth] = useState(null);

  // Fetch filter options on mount
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/dashboard/filters');
        const json = await res.json();
        if (json.status === 'success' && json.filters) {
          setFilterOptions(prev => ({
            ...prev,
            regions: json.filters.regions || [],
            categories: json.filters.categories || [],
            timeframes: json.filters.timeframes || prev.timeframes
          }));
        }
      } catch (e) {
        console.warn('Could not load filters from server, using presets:', e);
      }
    }
    loadFilterOptions();
  }, []);

  // Fetch interactive dashboard data when filters change
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (regionFilter !== 'All') params.append('region', regionFilter);
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (timeframeFilter !== 'All Time') params.append('timeframe', timeframeFilter);
      params.append('metric', activeMetric);

      const res = await fetch(`http://127.0.0.1:8000/api/dashboard/interactive?${params.toString()}`);
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching interactive dashboard:', err);
    } finally {
      setLoading(false);
      setCountdown(30);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [regionFilter, categoryFilter, timeframeFilter, activeMetric]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchDashboardData();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [autoRefresh, regionFilter, categoryFilter, timeframeFilter, activeMetric]);

  // Derived filtered & sorted products
  const sortedProducts = useMemo(() => {
    const list = dashboardData?.top_products || [];
    const filtered = list.filter(p =>
      (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.id || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const valA = a[sortKey] ?? 0;
      const valB = b[sortKey] ?? 0;
      return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  }, [dashboardData, searchQuery, sortKey, sortAsc]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const handleResetFilters = () => {
    setRegionFilter('All');
    setCategoryFilter('All');
    setTimeframeFilter('All Time');
  };

  const hasActiveFilters = regionFilter !== 'All' || categoryFilter !== 'All' || timeframeFilter !== 'All Time';

  // Export Data as JSON
  const handleExportJSON = () => {
    if (!dashboardData) return;
    const blob = new Blob([JSON.stringify(dashboardData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metricmind-dashboard-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Top Products as CSV
  const handleExportCSV = () => {
    const prods = dashboardData?.top_products || [];
    if (!prods.length) return;
    const headers = ['Product ID', 'Product Name', 'Category', 'Revenue ($)', 'Profit ($)', 'Units Sold', 'Margin (%)'];
    const rows = prods.map(p => [
      p.id, `"${p.name}"`, `"${p.category}"`, p.revenue, p.profit, p.units_sold, p.margin
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `metricmind-products-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Color Palette
  const PIE_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

  // Metric Labels & Formatter
  const getMetricConfig = () => {
    switch (activeMetric) {
      case 'profit':
        return {
          label: 'Net Profit',
          dataKey: 'profit',
          color: '#10b981',
          gradientId: 'colorProfit',
          unit: '$',
          format: (val) => `$${Number(val).toLocaleString()}`
        };
      case 'orders':
        return {
          label: 'Total Orders',
          dataKey: 'orders',
          color: '#06b6d4',
          gradientId: 'colorOrders',
          unit: '',
          format: (val) => Number(val).toLocaleString()
        };
      case 'margin':
        return {
          label: 'Profit Margin %',
          dataKey: 'margin',
          color: '#c084fc',
          gradientId: 'colorMargin',
          unit: '%',
          format: (val) => `${Number(val).toFixed(1)}%`
        };
      case 'revenue':
      default:
        return {
          label: 'Total Revenue',
          dataKey: 'revenue',
          color: '#6366f1',
          gradientId: 'colorRevenue',
          unit: '$',
          format: (val) => `$${Number(val).toLocaleString()}`
        };
    }
  };

  const metricConfig = getMetricConfig();

  // Custom Recharts Floating Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'rgba(15, 20, 34, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: '0.85rem 1rem',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
          minWidth: '180px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.35rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>{data.month || label}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>2025</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a5b4fc' }}>
              <span>Revenue:</span>
              <span style={{ fontWeight: 600 }}>${Number(data.revenue || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6ee7b7' }}>
              <span>Profit:</span>
              <span style={{ fontWeight: 600 }}>${Number(data.profit || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#7dd3fc' }}>
              <span>Orders:</span>
              <span style={{ fontWeight: 600 }}>{Number(data.orders || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e9d5ff' }}>
              <span>Margin:</span>
              <span style={{ fontWeight: 600 }}>{Number(data.margin || 0).toFixed(1)}%</span>
            </div>
            {data.target && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '0.25rem' }}>
                <span>Target:</span>
                <span>${Number(data.target).toLocaleString()}</span>
              </div>
            )}
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#6366f1', textAlign: 'center', cursor: 'pointer' }}>
            Click point to inspect month ↗
          </div>
        </div>
      );
    }
    return null;
  };

  const kpis = dashboardData?.kpis;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ================= 1. HEADER & INTERACTIVE CONTROL BAR ================= */}
      <div className="glass-panel" style={{
        padding: '1.5rem 1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
        borderColor: 'rgba(99, 102, 241, 0.25)'
      }}>
        {/* Top Header Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="pill-badge">Interactive BI Executive Suite</span>
              {autoRefresh && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '0.2rem 0.5rem', borderRadius: '999px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <span className="pulse-dot" /> Live ({countdown}s)
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', margin: 0 }}>
              Enterprise Performance <span className="gradient-text">Intelligence</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Direct interactive slice-and-dice across 4.45M transactions, 8 regions, and 15 product categories.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {/* Auto-Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="btn-secondary"
              style={{
                fontSize: '0.82rem',
                borderColor: autoRefresh ? 'var(--accent-emerald)' : undefined,
                color: autoRefresh ? '#34d399' : undefined
              }}
              title="Toggle automatic 30s background sync"
            >
              <Activity style={{ width: '15px', height: '15px' }} />
              {autoRefresh ? `Auto: On (${countdown}s)` : 'Auto: Off'}
            </button>

            {/* Manual Refresh */}
            <button
              onClick={fetchDashboardData}
              className="btn-secondary"
              disabled={loading}
              style={{ fontSize: '0.82rem' }}
              title="Refresh dataset from PostgreSQL"
            >
              <RefreshCw style={{ width: '15px', height: '15px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>

            {/* Export Menu */}
            <button
              onClick={handleExportCSV}
              className="btn-secondary"
              style={{ fontSize: '0.82rem' }}
              title="Download Top Products CSV"
            >
              <Download style={{ width: '15px', height: '15px' }} />
              Export CSV
            </button>

            {/* Ask AI Copilot */}
            {onNavigateToChat && (
              <button
                onClick={() => onNavigateToChat(`Summarize enterprise business metrics for ${regionFilter} in ${categoryFilter} during ${timeframeFilter}.`)}
                className="btn-primary"
                style={{ fontSize: '0.82rem', padding: '0.55rem 1rem' }}
              >
                <Sparkles style={{ width: '15px', height: '15px' }} />
                Ask AI Copilot
              </button>
            )}
          </div>
        </div>

        {/* Interactive Filter Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingTop: '0.85rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Left: Dropdown selectors & Time presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <Filter style={{ width: '14px', height: '14px' }} /> FILTERS:
            </span>

            {/* Timeframe Presets */}
            <div style={{ display: 'inline-flex', background: 'rgba(15, 20, 34, 0.8)', padding: '0.2rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              {filterOptions.timeframes.map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframeFilter(tf)}
                  className={`tab-btn ${timeframeFilter === tf ? 'active' : ''}`}
                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Region Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <MapPin style={{ width: '14px', height: '14px', color: '#38bdf8' }} />
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="select-control"
              >
                <option value="All">All Regions</option>
                {filterOptions.regions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Category Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Tag style={{ width: '14px', height: '14px', color: '#c084fc' }} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="select-control"
              >
                <option value="All">All Categories</option>
                {filterOptions.categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Active Filter Badges with clear button */}
          {hasActiveFilters && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active:</span>
              {regionFilter !== 'All' && (
                <span className="filter-chip">
                  Region: {regionFilter}
                  <button onClick={() => setRegionFilter('All')} className="filter-chip-remove">
                    <X style={{ width: '12px', height: '12px' }} />
                  </button>
                </span>
              )}
              {categoryFilter !== 'All' && (
                <span className="filter-chip">
                  Category: {categoryFilter}
                  <button onClick={() => setCategoryFilter('All')} className="filter-chip-remove">
                    <X style={{ width: '12px', height: '12px' }} />
                  </button>
                </span>
              )}
              {timeframeFilter !== 'All Time' && (
                <span className="filter-chip">
                  Period: {timeframeFilter}
                  <button onClick={() => setTimeframeFilter('All Time')} className="filter-chip-remove">
                    <X style={{ width: '12px', height: '12px' }} />
                  </button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="tab-btn"
                style={{ fontSize: '0.75rem', color: '#f43f5e', padding: '0.2rem 0.5rem' }}
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= 2. INTERACTIVE KPI CARDS ================= */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Primary Operational KPIs <span style={{ fontSize: '0.75rem', color: 'var(--accent-indigo)' }}>(Click any card to visualize that metric across all charts)</span>
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1.25rem'
        }}>
          {/* Card 1: Revenue */}
          <KpiCard
            title="Total Revenue"
            value={kpis ? `$${kpis.total_revenue.toLocaleString()}` : '$6,109,595,430'}
            change="+14.8%"
            isPositive={true}
            icon={DollarSign}
            color="indigo"
            isSelected={activeMetric === 'revenue'}
            onClick={() => setActiveMetric('revenue')}
            target="$6.0B"
            progress={102}
          />

          {/* Card 2: Net Profit */}
          <KpiCard
            title="Gross Profit"
            value={kpis ? `$${kpis.total_profit.toLocaleString()}` : '$1,051,417,195'}
            change="+12.4%"
            isPositive={true}
            icon={TrendingUp}
            color="emerald"
            isSelected={activeMetric === 'profit'}
            onClick={() => setActiveMetric('profit')}
            target="$1.0B"
            progress={105}
          />

          {/* Card 3: Orders */}
          <KpiCard
            title="Total Orders"
            value={kpis ? kpis.total_orders.toLocaleString() : '4,459,312'}
            change="+8.2%"
            isPositive={true}
            icon={ShoppingBag}
            color="cyan"
            isSelected={activeMetric === 'orders'}
            onClick={() => setActiveMetric('orders')}
            target="4.2M"
            progress={106}
          />

          {/* Card 4: Margin & Customers */}
          <KpiCard
            title="Profit Margin"
            value={kpis ? `${kpis.profit_margin}%` : '17.2%'}
            change="+1.8%"
            isPositive={true}
            icon={CreditCard}
            color="purple"
            isSelected={activeMetric === 'margin'}
            onClick={() => setActiveMetric('margin')}
            target="16.5%"
            progress={104}
          />
        </div>
      </div>

      {/* ================= 3. MAIN PERFORMANCE VISUALIZER ================= */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        {/* Visualizer Controls Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0 }}>
                {metricConfig.label} Dynamic Trend
              </h3>
              <span className="pill-badge" style={{ background: `${metricConfig.color}22`, color: metricConfig.color, borderColor: `${metricConfig.color}44` }}>
                {activeMetric.toUpperCase()} VIEW
              </span>
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Monthly progression for {regionFilter} • {categoryFilter} • {timeframeFilter} (Click any data point for month drilldown)
            </span>
          </div>

          {/* Right Controls: Chart Type Selector & Target Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {/* Target Line Toggle */}
            <button
              onClick={() => setShowTarget(!showTarget)}
              className={`tab-btn ${showTarget ? 'active' : ''}`}
              style={{ fontSize: '0.78rem' }}
              title="Toggle target benchmark dashed line"
            >
              Benchmark Target
            </button>

            {/* Chart Type Switches */}
            <div style={{ display: 'inline-flex', background: 'rgba(15, 20, 34, 0.8)', padding: '0.2rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setChartType('area')}
                className={`tab-btn ${chartType === 'area' ? 'active' : ''}`}
                title="Area Chart view"
              >
                <Layers style={{ width: '14px', height: '14px' }} />
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`tab-btn ${chartType === 'bar' ? 'active' : ''}`}
                title="Bar Chart view"
              >
                <BarChart3 style={{ width: '14px', height: '14px' }} />
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`tab-btn ${chartType === 'line' ? 'active' : ''}`}
                title="Line Chart view"
              >
                <LineIcon style={{ width: '14px', height: '14px' }} />
              </button>
              <button
                onClick={() => setChartType('dual')}
                className={`tab-btn ${chartType === 'dual' ? 'active' : ''}`}
                title="Dual Comparison view (Revenue vs Profit)"
              >
                Dual
              </button>
            </div>
          </div>
        </div>

        {/* Main Chart Area */}
        <div style={{ height: '320px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart
                data={dashboardData?.monthly || []}
                onClick={(e) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    setDrilldownMonth(e.activePayload[0].payload);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(v) => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}k` : v}
                />
                <Tooltip content={<CustomTooltip />} />
                {showTarget && <ReferenceLine y={500000000} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Target', fill: '#f59e0b', fontSize: 11 }} />}
                <Bar
                  dataKey={metricConfig.dataKey}
                  fill={metricConfig.color}
                  radius={[6, 6, 0, 0]}
                  cursor="pointer"
                />
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart
                data={dashboardData?.monthly || []}
                onClick={(e) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    setDrilldownMonth(e.activePayload[0].payload);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(v) => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}k` : v}
                />
                <Tooltip content={<CustomTooltip />} />
                {showTarget && <ReferenceLine y={500000000} stroke="#f59e0b" strokeDasharray="4 4" />}
                <Line
                  type="monotone"
                  dataKey={metricConfig.dataKey}
                  stroke={metricConfig.color}
                  strokeWidth={3}
                  dot={{ r: 5, fill: metricConfig.color, stroke: '#07090e', strokeWidth: 2 }}
                  activeDot={{ r: 8, fill: '#fff', stroke: metricConfig.color, strokeWidth: 3 }}
                  cursor="pointer"
                />
              </LineChart>
            ) : chartType === 'dual' ? (
              <LineChart
                data={dashboardData?.monthly || []}
                onClick={(e) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    setDrilldownMonth(e.activePayload[0].payload);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(v) => `${(v/1e6).toFixed(0)}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />
                <Line type="monotone" name="Revenue ($)" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" name="Profit ($)" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            ) : (
              // Default Area Chart
              <AreaChart
                data={dashboardData?.monthly || []}
                onClick={(e) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    setDrilldownMonth(e.activePayload[0].payload);
                  }
                }}
              >
                <defs>
                  <linearGradient id="primaryAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metricConfig.color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={metricConfig.color} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(v) => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}k` : v}
                />
                <Tooltip content={<CustomTooltip />} />
                {showTarget && <ReferenceLine y={500000000} stroke="#f59e0b" strokeDasharray="4 4" />}
                <Area
                  type="monotone"
                  dataKey={metricConfig.dataKey}
                  stroke={metricConfig.color}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#primaryAreaGrad)"
                  dot={{ r: 4, fill: metricConfig.color, stroke: '#07090e', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#fff', stroke: metricConfig.color, strokeWidth: 3 }}
                  cursor="pointer"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Drilldown modal notice if month clicked */}
        {drilldownMonth && (
          <div style={{
            marginTop: '1rem',
            padding: '0.85rem 1.25rem',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="pill-badge" style={{ background: '#6366f1', color: '#fff' }}>
                {drilldownMonth.month} 2025 Focus
              </span>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                Revenue: <strong>${Number(drilldownMonth.revenue).toLocaleString()}</strong> • 
                Profit: <strong>${Number(drilldownMonth.profit).toLocaleString()}</strong> • 
                Orders: <strong>{Number(drilldownMonth.orders).toLocaleString()}</strong> • 
                Margin: <strong>{Number(drilldownMonth.margin).toFixed(1)}%</strong>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {onNavigateToChat && (
                <button
                  onClick={() => onNavigateToChat(`Why did revenue reach $${Number(drilldownMonth.revenue).toLocaleString()} in ${drilldownMonth.month}? Provide a root-cause breakdown.`)}
                  className="btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                >
                  <Sparkles style={{ width: '13px', height: '13px' }} />
                  Deep-dive in Chat
                </button>
              )}
              <button
                onClick={() => setDrilldownMonth(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= 4. CROSS-FILTERING CHARTS (CATEGORY & REGION) ================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Category Share Donut */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Category Distribution</h3>
                <span className="pill-badge" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>Click slice to filter</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Contribution share across catalog categories</span>
            </div>

            {categoryFilter !== 'All' && (
              <button
                onClick={() => setCategoryFilter('All')}
                className="filter-chip"
                style={{ fontSize: '0.75rem' }}
              >
                Reset ({categoryFilter}) <X style={{ width: '12px', height: '12px' }} />
              </button>
            )}
          </div>

          <div style={{ height: '240px', width: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData?.categories || []}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={55}
                  paddingAngle={3}
                  cursor="pointer"
                  onClick={(entry) => {
                    if (entry && entry.category) {
                      setCategoryFilter(entry.category === categoryFilter ? 'All' : entry.category);
                    }
                  }}
                  onMouseEnter={(entry) => setHoveredSlice(entry)}
                  onMouseLeave={() => setHoveredSlice(null)}
                >
                  {(dashboardData?.categories || []).map((entry, index) => (
                    <Cell
                      key={`cat-cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                      stroke={categoryFilter === entry.category ? '#ffffff' : 'transparent'}
                      strokeWidth={categoryFilter === entry.category ? 2 : 0}
                      opacity={categoryFilter === 'All' || categoryFilter === entry.category ? 1 : 0.4}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name, props) => [`$${Number(val).toLocaleString()}`, name]}
                  contentStyle={{ background: '#0f1422', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Central Donut Readout */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                {hoveredSlice ? hoveredSlice.category : (categoryFilter !== 'All' ? categoryFilter : 'Total Categories')}
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {hoveredSlice ? `$${(hoveredSlice.value / 1e6).toFixed(1)}M` : `${dashboardData?.categories?.length || 0} active`}
              </span>
            </div>
          </div>
        </div>

        {/* Regional Performance Ranking */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Regional Territory Ranking</h3>
                <span className="pill-badge" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>Click bar to filter</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Revenue volume per geographic zone</span>
            </div>

            {regionFilter !== 'All' && (
              <button
                onClick={() => setRegionFilter('All')}
                className="filter-chip"
                style={{ fontSize: '0.75rem' }}
              >
                Reset ({regionFilter}) <X style={{ width: '12px', height: '12px' }} />
              </button>
            )}
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardData?.regions || []}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                onClick={(e) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    const reg = e.activePayload[0].payload.region;
                    setRegionFilter(reg === regionFilter ? 'All' : reg);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#64748b"
                  tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`}
                />
                <YAxis
                  type="category"
                  dataKey="region"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  width={65}
                />
                <Tooltip
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ background: '#0f1422', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#06b6d4"
                  radius={[0, 4, 4, 0]}
                  cursor="pointer"
                >
                  {(dashboardData?.regions || []).map((entry, index) => (
                    <Cell
                      key={`reg-cell-${index}`}
                      fill={regionFilter === entry.region ? '#38bdf8' : '#0891b2'}
                      opacity={regionFilter === 'All' || regionFilter === entry.region ? 1 : 0.4}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ================= 5. INTERACTIVE TOP PRODUCTS LEADERBOARD ================= */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        {/* Leaderboard Header with Search & Options */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0 }}>
              Top Products Performance Leaderboard
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Interactive catalog ranking • Click column headers to sort • Click 'Ask AI' for instant product analysis
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search style={{ width: '15px', height: '15px', color: 'var(--text-muted)', position: 'absolute', left: '10px' }} />
              <input
                type="text"
                placeholder="Search products or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'rgba(15, 20, 34, 0.8)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '0.45rem 0.85rem 0.45rem 2rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-sans)',
                  outline: 'none',
                  minWidth: '220px'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '8px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X style={{ width: '14px', height: '14px' }} />
                </button>
              )}
            </div>

            {/* Rows per page */}
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="select-control"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
            >
              <option value={5}>5 Rows</option>
              <option value={8}>8 Rows</option>
              <option value={10}>10 Rows</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="interactive-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('id')}>
                  ID {sortKey === 'id' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="sortable" onClick={() => handleSort('name')}>
                  Product Name {sortKey === 'name' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="sortable" onClick={() => handleSort('category')}>
                  Category {sortKey === 'category' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="sortable" onClick={() => handleSort('revenue')} style={{ textAlign: 'right' }}>
                  Revenue ($) {sortKey === 'revenue' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="sortable" onClick={() => handleSort('profit')} style={{ textAlign: 'right' }}>
                  Profit ($) {sortKey === 'profit' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="sortable" onClick={() => handleSort('units_sold')} style={{ textAlign: 'right' }}>
                  Units {sortKey === 'units_sold' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="sortable" onClick={() => handleSort('margin')} style={{ textAlign: 'right' }}>
                  Margin (%) {sortKey === 'margin' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th style={{ textAlign: 'center' }}>AI Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.slice(0, rowsPerPage).map((p, idx) => (
                <tr key={p.id || idx}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--accent-indigo)' }}>
                    {p.id}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {p.name}
                  </td>
                  <td>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#cbd5e1'
                    }}>
                      {p.category}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#f8fafc' }}>
                    ${Number(p.revenue).toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right', color: '#34d399', fontWeight: 500 }}>
                    ${Number(p.profit).toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {Number(p.units_sold).toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{
                      color: p.margin >= 18 ? '#34d399' : p.margin >= 15 ? '#38bdf8' : '#fbbf24',
                      fontWeight: 600
                    }}>
                      {p.margin}%
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {onNavigateToChat && (
                      <button
                        onClick={() => onNavigateToChat(`Provide a commercial performance breakdown and sales trend for ${p.name} (${p.id}) in ${p.category}.`)}
                        className="btn-secondary"
                        style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', gap: '0.25rem' }}
                        title="Query AI Copilot on this product"
                      >
                        <Sparkles style={{ width: '12px', height: '12px', color: '#c084fc' }} />
                        Ask AI
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= 6. AUTOMATED EXECUTIVE COPILOT SUMMARY ================= */}
      <div className="glass-panel" style={{
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(99, 102, 241, 0.06) 100%)',
        borderColor: 'rgba(139, 92, 246, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c084fc' }}>
            <Sparkles style={{ width: '18px', height: '18px' }} />
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>
              Automated AI Executive Summary
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {onNavigateToRootCause && (
              <button
                onClick={onNavigateToRootCause}
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderColor: 'rgba(139, 92, 246, 0.4)' }}
              >
                Launch Root Cause Analysis
                <ArrowRight style={{ width: '14px', height: '14px' }} />
              </button>
            )}
          </div>
        </div>

        <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
          {dashboardData?.ai_summary?.body ||
            'Overall business activity shows solid revenue growth peaking in Q2. High-value customer accounts and strategic discount caps have maintained healthy gross profit margins across regional territories.'}
        </p>

        <div style={{
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-indigo)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Strategic Recommendation
            </span>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginTop: '0.2rem', margin: 0 }}>
              {dashboardData?.ai_summary?.recommendation ||
                'Capitalize on high-margin catalog items by expanding stock allocation in top-performing regional territories.'}
            </p>
          </div>

          {onNavigateToChat && (
            <button
              onClick={() => onNavigateToChat('What actions can improve our gross profit margin across underperforming regions?')}
              className="btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
            >
              Discuss with Copilot
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
