import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Boxes,
  PackageCheck,
  Truck,
  ShoppingCart,
  Receipt,
  BrainCircuit,
  BellRing,
  ClipboardList,
  CalendarClock,
  BarChart3,
  FileSpreadsheet,
  BotMessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed }) => {
  // Use lifted state if provided, else local fallback
  const [localCollapsed, setLocalCollapsed] = useState(false);
  const collapsed = isCollapsed !== undefined ? isCollapsed : localCollapsed;
  const setCollapsed = setIsCollapsed || setLocalCollapsed;
  const { alerts, purchaseOrders, currentRole } = useApp();

  const activeAlertsCount = alerts.filter(a => a.status === 'active').length;
  const pendingPOsCount = purchaseOrders.filter(p => p.status === 'Pending' || p.status === 'Approved').length;

  const navGroups = [
    {
      group: 'Core Management',
      items: [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/inventory', label: 'Inventory', icon: Boxes },
        { path: '/products', label: 'Products', icon: PackageCheck },
        { path: '/suppliers', label: 'Suppliers', icon: Truck },
        { path: '/pos', label: 'POS Register', icon: ShoppingCart },
        { path: '/sales', label: 'Sales Invoices', icon: Receipt },
      ]
    },
    {
      group: 'Intelligence & Control',
      items: [
        { path: '/forecasting', label: 'AI Forecasting', icon: BrainCircuit, isAi: true },
        { path: '/alerts', label: 'Smart Alerts', icon: BellRing, badge: activeAlertsCount, badgeColor: 'bg-rose-500' },
        { path: '/purchase-orders', label: 'Purchase Orders', icon: ClipboardList, badge: pendingPOsCount, badgeColor: 'bg-blue-500' },
        { path: '/expiry', label: 'Expiry Tracking', icon: CalendarClock },
        { path: '/analytics', label: 'Sales Analytics', icon: BarChart3 },
      ]
    },
    {
      group: 'Tools & Config',
      items: [
        { path: '/csv', label: 'CSV Import/Export', icon: FileSpreadsheet },
        { path: '/assistant', label: 'AI Assistant', icon: BotMessageSquare, isAi: true },
        { path: '/settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                    Stockify<span className="text-blue-600">AI</span>
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                    ERP
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                  Retail Intelligence
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pb-1.5 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                  {group.group}
                </div>
              )}
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                    } ${collapsed ? 'justify-center' : ''}`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {!collapsed && (
                    <span className="flex-1 truncate flex items-center gap-1.5">
                      {item.label}
                      {item.isAi && (
                        <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                      )}
                    </span>
                  )}
                  {!collapsed && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full text-white ${
                        item.badgeColor || 'bg-blue-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {collapsed && item.badge > 0 && (
                    <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500"></span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* User Role Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 shrink-0">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  Role: {currentRole}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  Full Store Privileges
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
