import React, { useState, useEffect, useMemo } from 'react';
import KpiCard from './KpiCard';
import {
  DollarSign, ShoppingCart, ShoppingBag, CreditCard, Sparkles, Filter, RefreshCw,
  TrendingUp, TrendingDown, Download, BarChart3, LineChart as LineIcon,
  Layers, Search, ArrowUpDown, ChevronDown, Check, X, ArrowRight, Zap,
  Calendar, Globe, Building2, Tag, Activity, RotateCcw, Percent, BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine,
  LabelList
} from 'recharts';

export default function DashboardView({ onNavigateToChat, onNavigateToRootCause }) {
  // Filter States
  const [regionFilter, setRegionFilter] = useState('All');
  const [headquartersFilter, setHeadquartersFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [timeframeFilter, setTimeframeFilter] = useState('All Time');
  
  // Interactive View States
  const [activeMetric, setActiveMetric] = useState('revenue'); // 'revenue' | 'profit' | 'orders' | 'margin'
  const [chartType, setChartType] = useState('area'); // 'area' | 'bar' | 'line'
  const [targetMode, setTargetMode] = useState('Revenue vs Target');
  
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
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [countdown, setCountdown] = useState(30);

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
        console.warn('Could not load filters from server, using defaults:', e);
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
    setHeadquartersFilter('All');
    setCategoryFilter('All');
    setTimeframeFilter('All Time');
  };

  const hasActiveFilters = regionFilter !== 'All' || categoryFilter !== 'All' || timeframeFilter !== 'All Time' || headquartersFilter !== 'All';

  // Export Top Products as CSV
  const handleExportCSV = () => {
    const prods = dashboardData?.top_products || [];
    if (!prods.length) return;
    const headers = ['ID', 'Product Name', 'Category', 'Revenue ($)', 'Profit ($)', 'Units', 'Margin (%)'];
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

  // Modern Color Palette matching reference mockup
  const PIE_COLORS = [
    '#3b82f6', // Electronics (Blue)
    '#facc15', // Clothing (Yellow)
    '#ec4899', // Home & Kitchen (Pink)
    '#f43f5e', // Books (Red)
    '#10b981', // Beauty (Green)
    '#06b6d4', // Sports (Cyan)
    '#f97316', // Toys (Orange)
    '#94a3b8'  // Others (Gray)
  ];

  // Default Categories with percentage shares if live list exists
  const categoryPercentages = useMemo(() => {
    const cats = dashboardData?.categories || [];
    const totalVal = cats.reduce((acc, curr) => acc + curr.value, 0) || 1;
    return cats.map((c, idx) => ({
      ...c,
      color: PIE_COLORS[idx % PIE_COLORS.length],
      percentage: ((c.value / totalVal) * 100).toFixed(1)
    }));
  }, [dashboardData]);

  // Regional ranking data formatted for horizontal bar chart
  const regionalData = useMemo(() => {
    const raw = dashboardData?.regions || [];
    // Sort descending by revenue and take top 8
    return [...raw].sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  }, [dashboardData]);

  // Metric Labels & Formatter
  const getMetricConfig = () => {
    switch (activeMetric) {
      case 'profit':
        return {
          label: 'Gross Profit',
          dataKey: 'profit',
          color: '#10b981',
          format: (val) => `$${Number(val).toLocaleString()}`
        };
      case 'orders':
        return {
          label: 'Total Orders',
          dataKey: 'orders',
          color: '#06b6d4',
          format: (val) => Number(val).toLocaleString()
        };
      case 'margin':
        return {
          label: 'Profit Margin %',
          dataKey: 'margin',
          color: '#a855f7',
          format: (val) => `${Number(val).toFixed(1)}%`
        };
      case 'revenue':
      default:
        return {
          label: 'Total Revenue',
          dataKey: 'revenue',
          color: '#3b82f6',
          format: (val) => `$${Number(val).toLocaleString()}`
        };
    }
  };

  const metricConfig = getMetricConfig();

  // Custom Floating Tooltip for Area/Line Chart matching mockup
  const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'rgba(15, 20, 36, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '10px',
          padding: '0.65rem 0.95rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6)',
          minWidth: '150px'
        }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
            {data.month} 2024
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#ffffff', fontWeight: 700 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: metricConfig.color }} />
            <span>{metricConfig.label}: {metricConfig.format(data[metricConfig.dataKey])}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const kpis = dashboardData?.kpis;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      
      {/* ================= 1. HEADER & INTERACTIVE CONTROL BAR ================= */}
      <div className="glass-panel" style={{
        padding: '1.4rem 1.6rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        background: 'linear-gradient(135deg, rgba(20, 26, 54, 0.85) 0%, rgba(15, 20, 42, 0.75) 100%)',
        borderColor: 'rgba(255, 255, 255, 0.09)'
      }}>
        {/* Top Header Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ marginBottom: '0.4rem' }}>
              <span className="pill-badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#c7d2fe', borderColor: 'rgba(99, 102, 241, 0.4)' }}>
                INTERACTIVE BI EXECUTIVE SUITE
              </span>
            </div>
            <h2 style={{ fontSize: '1.85rem', color: '#ffffff', margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>
              Enterprise Performance <span className="gradient-text-purple">Intelligence</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
              Direct interactive slice-and-dice across 4.6M transactions, 8 regions, and 13 product categories.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {/* Auto-Refresh */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="btn-secondary"
              style={{
                borderColor: autoRefresh ? 'var(--accent-emerald)' : undefined,
                color: autoRefresh ? '#34d399' : undefined
              }}
              title="Toggle automatic 30s background sync"
            >
              <Zap style={{ width: '14px', height: '14px' }} />
              {autoRefresh ? `Auto: On (${countdown}s)` : 'Auto Off'}
            </button>

            {/* Manual Refresh */}
            <button
              onClick={fetchDashboardData}
              className="btn-secondary"
              disabled={loading}
              title="Refresh dataset from PostgreSQL"
            >
              <RefreshCw style={{ width: '14px', height: '14px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="btn-secondary"
              title="Download Top Products CSV"
            >
              <Download style={{ width: '14px', height: '14px' }} />
              Export CSV
            </button>

            {/* Ask AI Copilot */}
            {onNavigateToChat && (
              <button
                onClick={() => onNavigateToChat(`Summarize enterprise business performance for ${regionFilter} in ${categoryFilter} during ${timeframeFilter}.`)}
                className="btn-primary"
                style={{ padding: '0.55rem 1.15rem' }}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <Filter style={{ width: '14px', height: '14px' }} /> Filters:
            </span>

            {/* Timeframe Presets Dropdown / Buttons */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select
                value={timeframeFilter}
                onChange={(e) => setTimeframeFilter(e.target.value)}
                className="custom-select"
                style={{ paddingLeft: '2rem' }}
              >
                <option value="All Time">All Time</option>
                <option value="Q1">Q1</option>
                <option value="Q2">Q2</option>
                <option value="Q3">Q3</option>
                <option value="Q4">Q4</option>
                <option value="H1">H1</option>
                <option value="H2">H2</option>
              </select>
              <Calendar style={{ width: '14px', height: '14px', color: '#a5b4fc', position: 'absolute', left: '10px', pointerEvents: 'none' }} />
            </div>

            {/* Quick Quarter Buttons */}
            <div style={{ display: 'inline-flex', background: 'rgba(15, 20, 36, 0.85)', padding: '0.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              {['Q1', 'Q2', 'Q3', 'Q4'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframeFilter(timeframeFilter === tf ? 'All Time' : tf)}
                  className={`tab-btn ${timeframeFilter === tf ? 'active' : ''}`}
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.78rem' }}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Region Dropdown */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="custom-select"
                style={{ paddingLeft: '2rem' }}
              >
                <option value="All">All Regions</option>
                {filterOptions.regions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <Globe style={{ width: '14px', height: '14px', color: '#38bdf8', position: 'absolute', left: '10px', pointerEvents: 'none' }} />
            </div>

            {/* Headquarters / Channel Dropdown */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select
                value={headquartersFilter}
                onChange={(e) => setHeadquartersFilter(e.target.value)}
                className="custom-select"
                style={{ paddingLeft: '2rem' }}
              >
                <option value="All">All Headquarters</option>
                <option value="HQ North">HQ North</option>
                <option value="HQ South">HQ South</option>
                <option value="HQ East">HQ East</option>
                <option value="HQ West">HQ West</option>
              </select>
              <Building2 style={{ width: '14px', height: '14px', color: '#34d399', position: 'absolute', left: '10px', pointerEvents: 'none' }} />
            </div>

            {/* Category Dropdown */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="custom-select"
                style={{ paddingLeft: '2rem' }}
              >
                <option value="All">All Categories</option>
                {filterOptions.categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <Tag style={{ width: '14px', height: '14px', color: '#c084fc', position: 'absolute', left: '10px', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Right: Reset Filters Button */}
          <div>
            <button
              onClick={handleResetFilters}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
              title="Reset all filters to defaults"
            >
              <RotateCcw style={{ width: '13px', height: '13px' }} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ================= 2. PRIMARY OPERATIONAL KPIS ================= */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              PRIMARY OPERATIONAL KPIS
            </span>
            <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 500 }}>
              (CLICK ANY CARD TO VISUALIZE THAT METRIC ACROSS ALL CHARTS)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <Calendar style={{ width: '14px', height: '14px' }} />
            <span>Jan 2024 - Dec 2024</span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem'
        }}>
          {/* Card 1: Revenue */}
          <KpiCard
            title="Total Revenue"
            value={kpis ? `$${kpis.total_revenue.toLocaleString()}` : '$6,886,525.68'}
            change="+14.8%"
            isPositive={true}
            icon={BarChart2}
            color="indigo"
            isSelected={activeMetric === 'revenue'}
            onClick={() => setActiveMetric('revenue')}
            target="$6.0B"
            progress={100}
            showSparkline={false}
          />

          {/* Card 2: Net Profit */}
          <KpiCard
            title="Gross Profit"
            value={kpis ? `$${kpis.total_profit.toLocaleString()}` : '$1,186,804.84'}
            change="+12.4%"
            isPositive={true}
            icon={DollarSign}
            color="emerald"
            isSelected={activeMetric === 'profit'}
            onClick={() => setActiveMetric('profit')}
            target="$1.0B"
            progress={100}
            showSparkline={true}
          />

          {/* Card 3: Orders */}
          <KpiCard
            title="Total Orders"
            value={kpis ? kpis.total_orders.toLocaleString() : '5,000'}
            change="+8.2%"
            isPositive={true}
            icon={ShoppingCart}
            color="cyan"
            isSelected={activeMetric === 'orders'}
            onClick={() => setActiveMetric('orders')}
            target="4.5M"
            progress={100}
            showSparkline={true}
          />

          {/* Card 4: Margin */}
          <KpiCard
            title="Profit Margin"
            value={kpis ? `${kpis.profit_margin}%` : '17.2%'}
            change="+1.8%"
            isPositive={true}
            icon={Percent}
            color="purple"
            isSelected={activeMetric === 'margin'}
            onClick={() => setActiveMetric('margin')}
            target="16.5%"
            progress={100}
            showSparkline={true}
          />
        </div>
      </div>

      {/* ================= 3. TOTAL REVENUE DYNAMIC TREND ================= */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(12, 16, 32, 0.75)' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: 'rgba(59, 130, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BarChart3 style={{ width: '16px', height: '16px', color: '#60a5fa' }} />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
                {metricConfig.label} Dynamic Trend
              </h3>
              <span className="pill-badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#c7d2fe', fontSize: '0.65rem' }}>
                {activeMetric.toUpperCase()} VIEW
              </span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
              Monthly progression for All • All • All Time (Click any data point for month drilldown)
            </span>
          </div>

          {/* Right Controls: Mode Dropdown & Chart Type Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {/* Target Mode Dropdown */}
            <select
              value={targetMode}
              onChange={(e) => setTargetMode(e.target.value)}
              className="custom-select"
              style={{ fontSize: '0.78rem', padding: '0.35rem 1.8rem 0.35rem 0.75rem' }}
            >
              <option value="Revenue vs Target">Revenue vs Target</option>
              <option value="Year over Year">Year over Year</option>
              <option value="Cumulative Volume">Cumulative Volume</option>
            </select>

            {/* Chart Type Switches */}
            <div style={{ display: 'inline-flex', background: 'rgba(15, 20, 36, 0.85)', padding: '0.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                onClick={() => setChartType('area')}
                className={`tab-btn ${chartType === 'area' ? 'active' : ''}`}
                style={{ padding: '0.3rem 0.55rem' }}
                title="Area Chart view"
              >
                <Layers style={{ width: '14px', height: '14px' }} />
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`tab-btn ${chartType === 'bar' ? 'active' : ''}`}
                style={{ padding: '0.3rem 0.55rem' }}
                title="Bar Chart view"
              >
                <BarChart3 style={{ width: '14px', height: '14px' }} />
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`tab-btn ${chartType === 'line' ? 'active' : ''}`}
                style={{ padding: '0.3rem 0.55rem' }}
                title="Line Chart view"
              >
                <LineIcon style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Chart Area */}
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={dashboardData?.monthly || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(v) => v >= 1e6 ? `${(v/1e6).toFixed(0)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}K` : v}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <ReferenceLine y={500000} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
                <Bar
                  dataKey={metricConfig.dataKey}
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  cursor="pointer"
                />
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart data={dashboardData?.monthly || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(v) => v >= 1e6 ? `${(v/1e6).toFixed(0)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}K` : v}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <ReferenceLine y={500000} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
                <Line
                  type="natural"
                  dataKey={metricConfig.dataKey}
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#60a5fa', stroke: '#07090e', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#ffffff', stroke: '#3b82f6', strokeWidth: 3 }}
                  cursor="pointer"
                />
              </LineChart>
            ) : (
              // Default Area Chart matching mockup
              <AreaChart data={dashboardData?.monthly || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="splineAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(v) => v >= 1e6 ? `${(v/1e6).toFixed(0)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}K` : v}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <ReferenceLine y={500000} stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
                <Area
                  type="natural"
                  dataKey={metricConfig.dataKey}
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#splineAreaGrad)"
                  dot={{ r: 4, fill: '#93c5fd', stroke: '#060813', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#ffffff', stroke: '#3b82f6', strokeWidth: 3 }}
                  cursor="pointer"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= 4. CATEGORY DISTRIBUTION & REGIONAL TERRITORY RANKING ================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Category Distribution Donut with Legend List */}
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(12, 16, 32, 0.75)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>Category Distribution</h3>
                <span className="pill-badge" style={{ fontSize: '0.62rem', padding: '0.15rem 0.45rem' }}>CLICK SLICE TO FILTER</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Contribution share across catalog categories</span>
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

          {/* Donut Chart & Category Legend Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.25rem', alignItems: 'center' }}>
            {/* Donut graphic */}
            <div style={{ height: '220px', width: '220px', position: 'relative' }}>
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
                        opacity={categoryFilter === 'All' || categoryFilter === entry.category ? 1 : 0.45}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`$${Number(val).toLocaleString()}`, name]}
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
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                  Total Categories
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                  {dashboardData?.categories?.length || 13} active
                </span>
              </div>
            </div>

            {/* Category Percentages Legend List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '220px', overflowY: 'auto' }}>
              {categoryPercentages.slice(0, 8).map((c, idx) => (
                <div
                  key={idx}
                  onClick={() => setCategoryFilter(categoryFilter === c.category ? 'All' : c.category)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.35rem 0.6rem',
                    borderRadius: '6px',
                    background: categoryFilter === c.category ? 'rgba(255,255,255,0.08)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: c.color }} />
                    <span style={{ color: '#cbd5e1', fontWeight: 500 }}>{c.category}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>{c.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Regional Territory Ranking (Horizontal Bar Chart) */}
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(12, 16, 32, 0.75)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>Regional Territory Ranking</h3>
                <span className="pill-badge" style={{ fontSize: '0.62rem', padding: '0.15rem 0.45rem' }}>CLICK BAR TO FILTER</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Revenue volume per geographic zone</span>
            </div>

            <select className="custom-select" style={{ fontSize: '0.78rem', padding: '0.3rem 1.6rem 0.3rem 0.65rem' }}>
              <option value="Revenue">Revenue</option>
              <option value="Profit">Profit</option>
              <option value="Orders">Orders</option>
            </select>
          </div>

          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={regionalData}
                layout="vertical"
                margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
                onClick={(e) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    const reg = e.activePayload[0].payload.region;
                    setRegionFilter(reg === regionFilter ? 'All' : reg);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`}
                />
                <YAxis
                  type="category"
                  dataKey="region"
                  stroke="#64748b"
                  tick={{ fill: '#cbd5e1', fontSize: 11 }}
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
                  {regionalData.map((entry, index) => (
                    <Cell
                      key={`reg-bar-${index}`}
                      fill={regionFilter === entry.region ? '#38bdf8' : '#0284c7'}
                      opacity={regionFilter === 'All' || regionFilter === entry.region ? 1 : 0.45}
                    />
                  ))}
                  <LabelList
                    dataKey="revenue"
                    position="right"
                    formatter={(v) => `${(v / 1e6).toFixed(2)}M`}
                    fill="#94a3b8"
                    fontSize={10}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ================= 5. TOP PRODUCTS LEADERBOARD & AUTOMATED AI EXECUTIVE SUMMARY ================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Left: Top Products Performance Leaderboard */}
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(12, 16, 32, 0.75)' }}>
          {/* Header Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
                Top Products Performance Leaderboard
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Interactive catalog ranking • Click column headers to sort • Click 'Ask AI' for instant product analysis
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {/* Search Box */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search style={{ width: '13px', height: '13px', color: 'var(--text-muted)', position: 'absolute', left: '8px' }} />
                <input
                  type="text"
                  placeholder="Search products or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: 'rgba(15, 20, 36, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#f8fafc',
                    padding: '0.35rem 0.75rem 0.35rem 1.8rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-sans)',
                    outline: 'none',
                    minWidth: '180px'
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: '6px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X style={{ width: '12px', height: '12px' }} />
                  </button>
                )}
              </div>

              {/* Rows Dropdown */}
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="custom-select"
                style={{ fontSize: '0.78rem', padding: '0.35rem 1.6rem 0.35rem 0.65rem' }}
              >
                <option value={5}>5 Rows</option>
                <option value={8}>8 Rows</option>
                <option value={10}>10 Rows</option>
              </select>
            </div>
          </div>

          {/* Table matching mockup */}
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
                    Margin {sortKey === 'margin' ? (sortAsc ? '▲' : '▼') : ''}
                  </th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.slice(0, rowsPerPage).map((p, idx) => (
                  <tr key={p.id || idx}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#60a5fa', fontWeight: 600 }}>
                      {p.id}
                    </td>
                    <td style={{ fontWeight: 600, color: '#ffffff' }}>
                      {p.name}
                    </td>
                    <td>
                      <span style={{
                        padding: '0.15rem 0.45rem',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: '#cbd5e1'
                      }}>
                        {p.category}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#f8fafc' }}>
                      ${Number(p.revenue).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', color: '#34d399', fontWeight: 600 }}>
                      ${Number(p.profit).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', color: '#cbd5e1' }}>
                      {Number(p.units_sold).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{
                        color: p.margin >= 17 ? '#34d399' : p.margin >= 15 ? '#38bdf8' : '#fbbf24',
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
                          style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', gap: '0.25rem', borderRadius: '6px' }}
                          title="Query AI Copilot on this product"
                        >
                          <Sparkles style={{ width: '11px', height: '11px', color: '#c084fc' }} />
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

        {/* Right: Automated AI Executive Summary */}
        <div className="glass-panel" style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(20, 26, 54, 0.85) 0%, rgba(18, 22, 48, 0.75) 100%)',
          borderColor: 'rgba(99, 102, 241, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#c084fc' }}>
                <Sparkles style={{ width: '16px', height: '16px' }} />
                <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>
                  Automated AI Executive Summary
                </h3>
              </div>

              {onNavigateToRootCause && (
                <button
                  onClick={onNavigateToRootCause}
                  className="btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', borderColor: 'rgba(139, 92, 246, 0.4)' }}
                >
                  Launch Root Cause Analysis
                  <ArrowRight style={{ width: '13px', height: '13px' }} />
                </button>
              )}
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {dashboardData?.ai_summary?.body ||
                'Revenue reached $6,886,525.68 with a healthy gross profit of $1,186,804.84 (17.2% margin). Leading segment growth is anchored by Category 7 in the Region 7 territory across 5,000 transactions.'}
            </p>
          </div>

          {/* Strategic Recommendation Box */}
          <div style={{
            padding: '0.95rem 1.15rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.75rem' }}>💡</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  STRATEGIC RECOMMENDATION
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#ffffff', margin: 0, lineHeight: 1.4 }}>
                {dashboardData?.ai_summary?.recommendation ||
                  'Expand promotional inventory for Category 7 while introducing targeted pricing campaigns in secondary zones to maximize net margins.'}
              </p>
            </div>

            {onNavigateToChat && (
              <button
                onClick={() => onNavigateToChat('What actions can improve our gross profit margin across underperforming regions?')}
                className="btn-primary"
                style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
              >
                Discuss with Copilot →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
