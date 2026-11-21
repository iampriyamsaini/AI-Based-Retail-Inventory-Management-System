import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import {
  Package,
  Layers,
  CircleDollarSign,
  TrendingUp,
  AlertTriangle,
  XCircle,
  Clock,
  ShoppingCart,
  PlusCircle,
  ArrowRight,
  Boxes,
  Truck,
  Sparkles
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

export const Dashboard = () => {
  const navigate = useNavigate();
  const { products, sales, transactions, alerts, purchaseOrders, stats, settings } = useApp();

  // Category distribution for PieChart
  const categoryData = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + Number(p.currentStock || 0);
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [products]);

  // Top Selling Products calculated from sales
  const topSellingData = useMemo(() => {
    const itemSales = {};
    sales.forEach((s) => {
      s.items.forEach((item) => {
        itemSales[item.name] = (itemSales[item.name] || 0) + Number(item.quantity || 0);
      });
    });
    return Object.entries(itemSales)
      .map(([name, quantity]) => ({
        name: name.length > 18 ? name.slice(0, 18) + '...' : name,
        fullName: name,
        quantity
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [sales]);

  // Daily Sales Overview (Past 7 Days)
  const dailySalesData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    const mockAmounts = [3240, 4890, 4120, 5600, 7150, 8920, stats.todaySalesRevenue || 4350];
    return days.map((day, idx) => ({
      day,
      sales: mockAmounts[idx],
      orders: Math.floor(mockAmounts[idx] / 350)
    }));
  }, [stats.todaySalesRevenue]);

  // Monthly Revenue Data (Last 6 Months)
  const monthlyRevenueData = [
    { month: 'Jun', revenue: 98400, target: 90000 },
    { month: 'Jul', revenue: 112000, target: 100000 },
    { month: 'Aug', revenue: 128500, target: 110000 },
    { month: 'Sep', revenue: 121000, target: 115000 },
    { month: 'Oct', revenue: 145200, target: 125000 },
    { month: 'Nov (Est)', revenue: 164000, target: 140000 }
  ];

  // Colors for Category Pie Chart
  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  const recentTransactions = transactions.slice(0, 5);
  const recentSales = sales.slice(0, 5);
  const activeAlerts = alerts.filter(a => a.status === 'active').slice(0, 4);
  const recentPOs = purchaseOrders.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl text-white shadow-soft-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold backdrop-blur-sm mb-2 border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            AI Enterprise Inventory v2.0
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Welcome back, {settings.currentUser.name}
          </h2>
          <p className="text-blue-200/90 text-xs sm:text-sm mt-1 max-w-xl">
            Live operations dashboard for {settings.store.name}. You have{' '}
            <span className="font-bold text-white underline cursor-pointer" onClick={() => navigate('/alerts')}>
              {activeAlerts.length} restock alerts
            </span>{' '}
            and {stats.pendingPOs} purchase orders awaiting fulfillment.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/pos')}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            POS Register
          </button>
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold backdrop-blur-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Add Product
          </button>
          <button
            onClick={() => navigate('/purchase-orders')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold backdrop-blur-sm transition-all"
          >
            <Truck className="w-4 h-4" />
            New PO
          </button>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute right-0 -bottom-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 8 Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          subtitle="SKUs cataloged"
          icon={Package}
          color="blue"
          trend="+3 this week"
          trendType="up"
          onClick={() => navigate('/products')}
        />
        <StatCard
          title="Total Inventory Qty"
          value={stats.totalInventoryQty.toLocaleString()}
          subtitle="Physical units in store"
          icon={Layers}
          color="indigo"
          onClick={() => navigate('/inventory')}
        />
        <StatCard
          title="Inventory Valuation"
          value={formatCurrency(stats.inventoryValuation, settings.store.currency)}
          subtitle="At cost basis"
          icon={CircleDollarSign}
          color="emerald"
          trend="+8.2% MoM"
          trendType="up"
          onClick={() => navigate('/inventory')}
        />
        <StatCard
          title="Today's Sales"
          value={formatCurrency(stats.todaySalesRevenue, settings.store.currency)}
          subtitle={`${stats.todaySalesCount} orders completed`}
          icon={TrendingUp}
          color="emerald"
          trend="+14% vs yesterday"
          trendType="up"
          onClick={() => navigate('/sales')}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(164000, settings.store.currency)}
          subtitle="Target: ₹ 140,000"
          icon={TrendingUp}
          color="purple"
          trend="+17.1% ahead"
          trendType="up"
          onClick={() => navigate('/analytics')}
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockCount}
          subtitle="Below safety threshold"
          icon={AlertTriangle}
          color="amber"
          trend="Action required"
          trendType="down"
          onClick={() => navigate('/alerts')}
        />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStockCount}
          subtitle="Zero available stock"
          icon={XCircle}
          color="rose"
          trend="Immediate restock"
          trendType="down"
          onClick={() => navigate('/alerts')}
        />
        <StatCard
          title="Pending POs"
          value={stats.pendingPOs}
          subtitle="Awaiting delivery"
          icon={Clock}
          color="blue"
          onClick={() => navigate('/purchase-orders')}
        />
      </div>

      {/* Primary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Sales Trends */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Sales Overview</h3>
              <p className="text-xs text-slate-400">7-Day revenue & checkout volume</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg">
              Live POS Feed
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySalesData}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(val) => [`₹ ${val.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', borderColor: '#1e293b', color: '#fff' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Category Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Stock by Category</h3>
              <p className="text-xs text-slate-400">Total units distribution</p>
            </div>
          </div>
          <div className="h-56 relative flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} units`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', borderColor: '#1e293b', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom legend */}
          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            {categoryData.slice(0, 4).map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                <span className="text-slate-600 dark:text-slate-400 truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Revenue vs Target</h3>
              <p className="text-xs text-slate-400">Historical performance & target comparison</p>
            </div>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  formatter={(val) => [`₹ ${val.toLocaleString()}`]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', borderColor: '#1e293b', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="revenue" name="Actual Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target Target" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top Moving Products</h3>
              <p className="text-xs text-slate-400">Based on recent POS checkout transactions</p>
            </div>
            <button
              onClick={() => navigate('/analytics')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-1"
            >
              Analytics <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSellingData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.15} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={90} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${val} units sold`, 'Volume']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', borderColor: '#1e293b', color: '#fff' }}
                />
                <Bar dataKey="quantity" fill="#10b981" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Operational Grids: Recent Transactions, Sales, Alerts, POs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inventory Transactions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Inventory Audit Trail</h3>
            </div>
            <button
              onClick={() => navigate('/inventory')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Full Ledger
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {tx.productName}
                    </span>
                    <Badge size="sm">{tx.type}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{tx.reason}</p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`font-bold ${
                      tx.type === 'Stock In'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : tx.type === 'Stock Out'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {tx.type === 'Stock In' ? `+${tx.quantity}` : tx.type === 'Stock Out' ? `-${tx.quantity}` : `${tx.quantity > 0 ? '+' : ''}${tx.quantity}`}
                  </span>
                  <p className="text-[10px] text-slate-400">{tx.date.split(' ')[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Low Stock Restock Alerts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Stockout Alerts</h3>
            </div>
            <button
              onClick={() => navigate('/alerts')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Manage ({activeAlerts.length})
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activeAlerts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No active alerts. Inventory healthy!</p>
            ) : (
              activeAlerts.map((alt) => (
                <div key={alt.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {alt.productName}
                      </span>
                      <Badge size="sm">{alt.severity}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Current: <strong className="text-slate-700 dark:text-slate-300">{alt.currentStock}</strong> | Min: {alt.reorderPoint} | Rec. Order: +{alt.recommendedOrderQty}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/purchase-orders')}
                    className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-lg shrink-0 transition-colors"
                  >
                    Create PO
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent POS Sales Invoices */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent POS Sales Invoices</h3>
            </div>
            <button
              onClick={() => navigate('/sales')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              All Invoices
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentSales.map((sale) => (
              <div key={sale.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {sale.invoiceNumber}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {sale.customerName} • {sale.items.length} items • {sale.paymentMethod}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(sale.total, settings.store.currency)}
                  </span>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Completed</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Purchase Orders */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Purchase Orders</h3>
            </div>
            <button
              onClick={() => navigate('/purchase-orders')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Manage Orders
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentPOs.map((po) => (
              <div key={po.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{po.poNumber}</span>
                    <Badge size="sm">{po.status}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{po.supplierName}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(po.totalAmount, settings.store.currency)}
                  </span>
                  <p className="text-[10px] text-slate-400">{po.orderDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
