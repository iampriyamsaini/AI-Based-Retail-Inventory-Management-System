import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  Search,
  Moon,
  Sun,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  User,
  Shield,
  LogOut,
  Sparkles,
  X
} from 'lucide-react';

export const Navbar = ({ setIsMobileOpen }) => {
  const {
    theme,
    toggleTheme,
    currentRole,
    switchRole,
    globalSearchQuery,
    setGlobalSearchQuery,
    alerts,
    resolveAlert,
    settings,
    addToast
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeAlerts = alerts.filter(a => a.status === 'active');

  // Derive dynamic page title
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/':
        return 'Executive Overview';
      case '/inventory':
        return 'Inventory Tracking & Stock Ledger';
      case '/products':
        return 'Product Catalog & Master Data';
      case '/suppliers':
        return 'Supplier Directory & Vendor Lead Times';
      case '/pos':
        return 'Point of Sale (POS) Register';
      case '/sales':
        return 'Sales Records & Tax Invoices';
      case '/forecasting':
        return 'AI Demand Forecasting & Predictive Restock';
      case '/alerts':
        return 'Smart Restock Alerts & Stockout Prevention';
      case '/purchase-orders':
        return 'Purchase Order Workflow & Goods Receipt';
      case '/expiry':
        return 'Shelf Life & Expiry Management';
      case '/analytics':
        return 'Business Analytics & Demand Anomalies';
      case '/csv':
        return 'Data Migration (CSV Import & Export)';
      case '/assistant':
        return 'Stockify AI Retail Assistant';
      case '/settings':
        return 'System Preferences & Store Configuration';
      default:
        return 'Stockify AI';
    }
  };

  const handleLogout = () => {
    setProfileOpen(false);
    addToast('Logged out of session. Session state safely preserved in browser.', 'info');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      {/* Left: Mobile trigger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            {getPageTitle(location.pathname)}
          </h1>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">
            {settings.store.name} • {settings.store.gstNumber}
          </p>
        </div>
      </div>

      {/* Right: Search, Notifications, Theme, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar */}
        <div className="relative hidden md:block w-56 lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            placeholder="Search items, SKU, suppliers..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all"
          />
          {globalSearchQuery && (
            <button
              onClick={() => setGlobalSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* AI Shortcut Button */}
        <button
          onClick={() => navigate('/assistant')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Ask AI</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {activeAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Active Alerts</h4>
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
                    {activeAlerts.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate('/alerts');
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  View All
                </button>
              </div>

              <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                {activeAlerts.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    All clear! No pending inventory alerts.
                  </div>
                ) : (
                  activeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {alert.productName}
                          </span>
                          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold ml-1">
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Current Stock: <strong className="text-slate-800 dark:text-slate-200">{alert.currentStock}</strong> (Min: {alert.reorderPoint})
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">{alert.createdAt}</span>
                          <button
                            onClick={() => resolveAlert(alert.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Resolve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Profile & Role Switcher */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <img
              src={settings.currentUser.avatar}
              alt={settings.currentUser.name}
              className="w-7 h-7 rounded-lg object-cover ring-2 ring-slate-200 dark:ring-slate-700"
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {settings.currentUser.name}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                {currentRole}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{settings.currentUser.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{settings.currentUser.email}</p>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                  <Shield className="w-3 h-3" />
                  Role: {currentRole}
                </div>
              </div>

              {/* Role Simulation Switcher */}
              <div className="py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Role (Demo)
                </span>
                <div className="mt-1 grid grid-cols-3 gap-1 px-2">
                  {['Admin', 'Manager', 'Staff'].map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        switchRole(role);
                        setProfileOpen(false);
                      }}
                      className={`px-2 py-1 text-xs font-semibold rounded-lg text-center transition-colors ${
                        currentRole === role
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  Account Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
