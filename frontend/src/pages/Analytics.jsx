import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { ANOMALY_RECORDS } from '../data/mockData';
import { Badge } from '../components/common/Badge';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export const Analytics = () => {
  const { sales, products, settings } = useApp();
  const [timeframe, setTimeframe] = useState('monthly'); // 'daily' | 'weekly' | 'monthly'
  const [anomalies, setAnomalies] = useState(ANOMALY_RECORDS);

  // Timeframe Data
  const trendData = useMemo(() => {
    if (timeframe === 'daily') {
      return [
        { label: '08:00', revenue: 1400, transactions: 4 },
        { label: '10:00', revenue: 3800, transactions: 11 },
        { label: '12:00', revenue: 6200, transactions: 18 },
        { label: '14:00', revenue: 4900, transactions: 14 },
        { label: '16:00', revenue: 7800, transactions: 22 },
        { label: '18:00', revenue: 9500, transactions: 28 },
        { label: '20:00', revenue: 5400, transactions: 16 }
      ];
    } else if (timeframe === 'weekly') {
      return [
        { label: 'Mon', revenue: 28400, transactions: 78 },
        { label: 'Tue', revenue: 31200, transactions: 84 },
        { label: 'Wed', revenue: 26500, transactions: 72 },
        { label: 'Thu', revenue: 34900, transactions: 92 },
        { label: 'Fri', revenue: 41800, transactions: 110 },
        { label: 'Sat', revenue: 52300, transactions: 142 },
        { label: 'Sun', revenue: 47900, transactions: 130 }
      ];
    } else {
      return [
        { label: 'May', revenue: 118000, margin: 23.4 },
        { label: 'Jun', revenue: 132000, margin: 24.1 },
        { label: 'Jul', revenue: 145000, margin: 24.8 },
        { label: 'Aug', revenue: 139000, margin: 23.9 },
        { label: 'Sep', revenue: 154000, margin: 25.2 },
        { label: 'Oct', revenue: 168000, margin: 25.8 },
        { label: 'Nov', revenue: 182000, margin: 26.4 }
      ];
    }
  }, [timeframe]);

  // Best Selling vs Least Selling
  const productPerformances = useMemo(() => {
    const counts = {};
    sales.forEach(s => {
      s.items.forEach(i => {
        counts[i.name] = (counts[i.name] || 0) + i.quantity;
      });
    });

    const list = products.map(p => ({
      name: p.name,
      shortName: p.name.length > 20 ? p.name.slice(0, 20) + '...' : p.name,
      category: p.category,
      unitsSold: counts[p.name] || 0,
      stock: p.currentStock,
      margin: (((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100).toFixed(1)
    }));

    list.sort((a, b) => b.unitsSold - a.unitsSold);
    return {
      best: list.slice(0, 5),
      least: list.slice(-5).reverse()
    };
  }, [sales, products]);

  // Category Sales Pie
  const categorySalesData = useMemo(() => {
    const cats = {};
    products.forEach(p => {
      cats[p.category] = (cats[p.category] || 0) + (p.sellingPrice * (p.currentStock > 10 ? 15 : 5));
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [products]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  const handleVerifyAnomaly = (id) => {
    setAnomalies(prev =>
      prev.map(a => (a.id === id ? { ...a, status: 'Resolved' } : a))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Timeframe Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Business Intelligence & Analytics</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Multi-period revenue metrics, product velocity matrices and demand anomaly detection
          </p>
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold self-start sm:self-auto">
          {['daily', 'weekly', 'monthly'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                timeframe === t
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t} View
            </button>
          ))}
        </div>
      </div>

      {/* Main Revenue Trend Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
              {timeframe} Revenue & Growth Trajectory
            </h3>
            <p className="text-xs text-slate-400">Aggregated sales performance across selected horizon</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
            +18.4% YoY Growth
          </span>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip
                formatter={(val) => [`₹ ${val.toLocaleString()}`, 'Gross Revenue']}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', borderColor: '#1e293b', color: '#fff' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#analyticsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Best vs Least Moving Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Selling Products */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Fast-Moving Velocity Items</h3>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600">High Turnover</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {productPerformances.best.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="min-w-0 flex-1 pr-3">
                  <span className="font-bold text-slate-900 dark:text-white truncate block">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-slate-400">{item.category} • Margin: {item.margin}%</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block">
                    {item.unitsSold} units sold
                  </span>
                  <span className="text-[10px] text-slate-400">Stock: {item.stock} left</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slow Moving Products */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Slow-Moving & Aging Inventory</h3>
            </div>
            <span className="text-[11px] font-semibold text-amber-600">Promotion Candidates</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {productPerformances.least.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="min-w-0 flex-1 pr-3">
                  <span className="font-bold text-slate-900 dark:text-white truncate block">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-slate-400">{item.category} • Margin: {item.margin}%</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-slate-500 block">{item.unitsSold} units sold</span>
                  <span className="text-[10px] text-amber-600 font-semibold">{item.stock} units locked in stock</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Anomaly Detection Section (Clearly labeled demonstration) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Automated Demand Anomaly Detection Engine
              </h3>
              <p className="text-xs text-slate-400">
                Isolation Forest & Z-score statistical pattern outlier identifier
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1 self-start sm:self-auto">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Demonstration Mode
          </span>
        </div>

        {/* Demo Disclaimer notice */}
        <div className="p-3 bg-purple-50/60 dark:bg-purple-950/20 rounded-xl text-xs text-purple-900 dark:text-purple-300 border border-purple-100 dark:border-purple-900">
          <strong>Demonstration Interface:</strong> The anomalies listed below illustrate how unexpected retail demand deviations (spikes, abrupt drop-offs, phantom inventory stockouts) are flagged for manager review before future Python backend automated retraining is initiated.
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {anomalies.map((anom) => (
            <div key={anom.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">{anom.productName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                    {anom.detectedType}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  <strong>Impact:</strong> {anom.impact} • <strong>Suspected Cause:</strong> {anom.suspectedCause}
                </p>
                <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-400">
                  <span>Detected: {anom.date}</span>
                  <span>Confidence: <strong className="text-purple-600 dark:text-purple-400">{anom.confidence}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    anom.status === 'Resolved'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400'
                  }`}
                >
                  {anom.status}
                </span>
                {anom.status !== 'Resolved' && (
                  <button
                    onClick={() => handleVerifyAnomaly(anom.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verify & Dismiss
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
