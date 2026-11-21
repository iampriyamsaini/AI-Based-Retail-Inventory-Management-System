import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  Settings as SettingsIcon,
  Store,
  User,
  Shield,
  Palette,
  Bell,
  Users,
  RefreshCw,
  Save,
  CheckCircle2,
  Trash2,
  Plus,
  Edit2,
  Sun,
  Moon,
  ChevronRight,
  Receipt,
  Database,
  Lock,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

const TAB_LIST = [
  { id: 'store', label: 'Store Config', icon: Store },
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'users', label: 'Team Members', icon: Users },
  { id: 'preferences', label: 'Preferences', icon: Palette },
  { id: 'data', label: 'Data Management', icon: Database }
];

export const Settings = () => {
  const { settings, updateSettings, toggleTheme, theme, resetToFactoryMock, currentRole, addToast } = useApp();

  const [activeTab, setActiveTab] = useState('store');
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ─── Local form states ───────────────────────────────────────────────
  const [storeForm, setStoreForm] = useState({ ...settings.store });
  const [profileForm, setProfileForm] = useState({ ...settings.currentUser });
  const [prefsForm, setPrefsForm] = useState({ ...settings.preferences });

  // User management
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Staff', status: 'Active' });
  const [teamMembers, setTeamMembers] = useState([...settings.teamMembers]);

  // ─── Handlers ──────────────────────────────────────────────────────
  const handleSaveStore = async () => {
    setIsSaving(true);
    await updateSettings({ ...settings, store: storeForm });
    setIsSaving(false);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await updateSettings({ ...settings, currentUser: profileForm });
    setIsSaving(false);
  };

  const handleSavePrefs = async () => {
    setIsSaving(true);
    await updateSettings({ ...settings, preferences: prefsForm });
    setIsSaving(false);
  };

  const handleSaveTeam = async () => {
    setIsSaving(true);
    await updateSettings({ ...settings, teamMembers });
    setIsSaving(false);
    addToast('Team roster updated successfully.', 'success');
  };

  const handleAddUser = () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      addToast('Name and email are required.', 'error');
      return;
    }
    const user = {
      ...newUser,
      id: `USR-${String(teamMembers.length + 1).padStart(3, '0')}`
    };
    setTeamMembers(prev => [...prev, user]);
    setNewUser({ name: '', email: '', role: 'Staff', status: 'Active' });
    setIsAddUserOpen(false);
    addToast(`Team member "${user.name}" added.`, 'success');
  };

  const handleRemoveUser = (id) => {
    if (id === settings.currentUser.id) {
      addToast('You cannot remove your own account.', 'error');
      return;
    }
    setTeamMembers(prev => prev.filter(u => u.id !== id));
    addToast('Team member removed.', 'info');
  };

  const handleToggleUserStatus = (id) => {
    setTeamMembers(prev =>
      prev.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">System Preferences & Configuration</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your store details, user accounts, billing preferences and application behavior
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tab Navigation */}
        <div className="lg:w-56 shrink-0">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-soft space-y-1">
            {TAB_LIST.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{tab.label}</span>
                {activeTab === tab.id && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Main Settings Content */}
        <div className="flex-1 min-w-0">
          {/* ─── STORE CONFIGURATION ─── */}
          {activeTab === 'store' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft space-y-4">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Store className="w-4 h-4 text-blue-600" />
                  Store & Business Details
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">These details appear on POS invoices and official store communications</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {[
                  { label: 'Store / Business Name *', key: 'name', placeholder: 'e.g. Stockify Supermart' },
                  { label: 'Store Code / Branch ID', key: 'storeCode', placeholder: 'e.g. STK-BLR-04' },
                  { label: 'GSTIN Registration Number', key: 'gstNumber', placeholder: '29AABCU9603R1ZM' },
                  { label: 'Primary Contact Phone', key: 'phone', placeholder: '+91 80 4123 9900' },
                  { label: 'Official Email Address', key: 'email', placeholder: 'contact@yourstore.com' },
                  { label: 'Default GST Tax Rate (%)', key: 'taxRate', type: 'number', placeholder: '5' }
                ].map(field => (
                  <div key={field.key}>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{field.label}</label>
                    <input
                      type={field.type || 'text'}
                      value={storeForm[field.key] || ''}
                      onChange={(e) => setStoreForm({ ...storeForm, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                    />
                  </div>
                ))}

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Business Address</label>
                  <textarea
                    rows={2}
                    value={storeForm.address || ''}
                    onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                    placeholder="Complete registered business address"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">POS Invoice Header Message</label>
                  <input
                    type="text"
                    value={storeForm.receiptHeader || ''}
                    onChange={(e) => setStoreForm({ ...storeForm, receiptHeader: e.target.value })}
                    placeholder="e.g. Thank you for shopping with us!"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">POS Invoice Footer / Returns Policy</label>
                  <input
                    type="text"
                    value={storeForm.receiptFooter || ''}
                    onChange={(e) => setStoreForm({ ...storeForm, receiptFooter: e.target.value })}
                    placeholder="e.g. Goods once sold can be exchanged within 7 days."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveStore}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Store Configuration
                </button>
              </div>
            </div>
          )}

          {/* ─── MY PROFILE ─── */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft space-y-4">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  My Account Profile
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Your identity used in audit trails, invoices and system access logs</p>
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={profileForm.avatar}
                  alt={profileForm.name}
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{profileForm.name}</h4>
                  <p className="text-xs text-slate-400">{profileForm.email}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                      <Shield className="w-3 h-3" />
                      {profileForm.role}
                    </span>
                    <span className="text-[10px] text-slate-400">{profileForm.department}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                {[
                  { label: 'Full Name', key: 'name' },
                  { label: 'Email Address', key: 'email' },
                  { label: 'Job Designation', key: 'designation' },
                  { label: 'Department', key: 'department' }
                ].map(field => (
                  <div key={field.key}>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{field.label}</label>
                    <input
                      type="text"
                      value={profileForm[field.key] || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, [field.key]: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                    />
                  </div>
                ))}

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Profile Avatar Image URL</label>
                  <input
                    type="text"
                    value={profileForm.avatar || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Role-based Access Notice */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Lock className="w-3.5 h-3.5" />
                  Frontend Role Access Control (Demo)
                </div>
                Your current role <strong>{currentRole}</strong> controls UI visibility. Backend authorization (JWT, MongoDB RBAC) will be implemented in Phase 2 and will enforce actual permissions server-side.
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Update Profile
                </button>
              </div>
            </div>
          )}

          {/* ─── TEAM MEMBERS ─── */}
          {activeTab === 'users' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Team Members & Role Management
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Role assignment is for UI access simulation; backend RBAC is a Phase 2 deliverable</p>
                </div>
                <button
                  onClick={() => setIsAddUserOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Member
                </button>
              </div>

              {/* Role Descriptions */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                {[
                  { role: 'Admin', color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800', desc: 'Full system access — all modules, settings, data management' },
                  { role: 'Manager', color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800', desc: 'Inventory, PO, analytics access. No system settings' },
                  { role: 'Staff', color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', desc: 'POS register, product lookup and stock viewing only' }
                ].map(r => (
                  <div key={r.role} className={`p-3 rounded-xl border ${r.color}`}>
                    <span className="font-bold block mb-1">{r.role}</span>
                    <span className="text-[10px] opacity-80">{r.desc}</span>
                  </div>
                ))}
              </div>

              {/* Team Table */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {teamMembers.map((user) => (
                  <div key={user.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-sm shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{user.name}</span>
                          {user.id === settings.currentUser.id && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">You</span>
                          )}
                        </div>
                        <span className="text-slate-400">{user.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.role === 'Admin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                        : user.role === 'Manager' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                      }`}>
                        {user.role}
                      </span>
                      <button
                        onClick={() => handleToggleUserStatus(user.id)}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          user.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        }`}
                      >
                        {user.status}
                      </button>
                      {user.id !== settings.currentUser.id && (
                        <button
                          onClick={() => handleRemoveUser(user.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveTeam}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Team Roster
                </button>
              </div>
            </div>
          )}

          {/* ─── PREFERENCES ─── */}
          {activeTab === 'preferences' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft space-y-5">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-blue-600" />
                  Application Preferences & UI Settings
                </h3>
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Interface Color Mode</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Switch between light and dark application theme</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center transition-all ${
                    theme === 'dark' ? 'left-6' : 'left-0.5'
                  }`}>
                    {theme === 'dark' ? (
                      <Moon className="w-3 h-3 text-blue-600" />
                    ) : (
                      <Sun className="w-3 h-3 text-amber-500" />
                    )}
                  </div>
                </button>
              </div>

              {/* Preference Toggles */}
              <div className="space-y-3">
                {[
                  { key: 'enableEmailAlerts', label: 'Enable Email Stockout Alerts', desc: 'Receive email notifications when stock falls below threshold' },
                  { key: 'enableSoundEffects', label: 'Enable POS Sound Effects', desc: 'Play audio feedback on successful checkout and error events' },
                  { key: 'autoPrintReceipt', label: 'Auto-Print POS Receipt', desc: 'Automatically trigger receipt print dialog after each sale' },
                  { key: 'compactView', label: 'Compact Table View', desc: 'Reduce row height and padding in data tables for more information density' }
                ].map((pref) => (
                  <div
                    key={pref.key}
                    className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{pref.label}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{pref.desc}</p>
                    </div>
                    <button
                      onClick={() => setPrefsForm(prev => ({ ...prev, [pref.key]: !prev[pref.key] }))}
                      className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ml-3 ${
                        prefsForm[pref.key] ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                        prefsForm[pref.key] ? 'left-5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Threshold Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Global Low Stock Alert Threshold (units)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={prefsForm.lowStockThresholdGlobal}
                    onChange={(e) => setPrefsForm({ ...prefsForm, lowStockThresholdGlobal: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Expiry Advance Warning Period (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={prefsForm.expiryAlertDays}
                    onChange={(e) => setPrefsForm({ ...prefsForm, expiryAlertDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSavePrefs}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* ─── DATA MANAGEMENT ─── */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600" />
                    Data Storage & localStorage Status
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {[
                    { label: 'Storage Engine', value: 'Browser localStorage (Phase 1)' },
                    { label: 'Data Persistence', value: 'Per-browser-session, persists on refresh' },
                    { label: 'Backend Status', value: 'FastAPI + MongoDB (Phase 2 Planned)' }
                  ].map(item => (
                    <div key={item.label} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">{item.label}</span>
                      <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger Zone: Reset */}
              <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 shadow-soft">
                <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2 pb-3 border-b border-rose-100 dark:border-rose-900/50 mb-4">
                  <AlertTriangle className="w-4 h-4" />
                  Danger Zone — Data Reset
                </h3>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Reset All Data to Factory Demo State</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      This will clear all your products, suppliers, sales, purchase orders, and inventory records and restore the original Stockify AI demonstration dataset. This action cannot be undone.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsResetOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors whitespace-nowrap shrink-0 self-start"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset to Mock Data
                  </button>
                </div>
              </div>

              {/* Architecture Note */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl text-xs text-blue-800 dark:text-blue-300">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block mb-1">Phase 2 Architecture Plan (Backend Integration)</strong>
                    The entire localStorage-based data layer in <code className="font-mono bg-blue-100 dark:bg-blue-900/60 px-1 py-0.5 rounded">src/services/api.js</code> is built with async wrappers that mirror future REST endpoint contracts. Replacing localStorage calls with real Axios HTTP requests to a FastAPI + MongoDB backend will require minimal frontend changes — only the base URLs and authentication headers need updating.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Add Team Member"
        subtitle="Invite a new staff member or manager to access the Stockify AI system"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="e.g. Priya Sharma"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="priya.sharma@store.com"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">System Role</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
            >
              <option value="Staff">Staff — POS & View Only</option>
              <option value="Manager">Manager — Inventory & Analytics</option>
              <option value="Admin">Admin — Full System Access</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsAddUserOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleAddUser}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
            >
              Add Member
            </button>
          </div>
        </div>
      </Modal>

      {/* Reset Confirm Modal */}
      <ConfirmModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={resetToFactoryMock}
        title="Reset All Data to Demo State"
        message="This will permanently erase all custom products, sales, purchase orders, inventory transactions, and supplier records you have created, and restore the original Stockify AI demonstration dataset. Are you absolutely sure?"
        confirmText="Yes, Reset All Data"
        confirmVariant="danger"
      />
    </div>
  );
};
