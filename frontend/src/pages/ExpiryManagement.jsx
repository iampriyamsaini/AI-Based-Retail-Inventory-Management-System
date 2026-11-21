import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, getExpiryStatus } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import {
  CalendarClock,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Trash2,
  Plus,
  Search,
  Filter,
  Layers,
  History
} from 'lucide-react';

export const ExpiryManagement = () => {
  const { products, wastageRecords, recordWastage, settings, globalSearchQuery } = useApp();

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'wastage'
  const [filterType, setFilterType] = useState('All'); // 'All' | 'Expired' | 'Near Expiry' | 'Good'
  const [search, setSearch] = useState('');

  // Wastage Modal
  const [isWastageOpen, setIsWastageOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [wastageQty, setWastageQty] = useState('');
  const [wastageReason, setWastageReason] = useState('Expired shelf life prior to retail sale');
  const [wastageError, setWastageError] = useState('');

  const effectiveSearch = (search || globalSearchQuery).toLowerCase();

  // Products with expiry metadata
  const categorizedProducts = useMemo(() => {
    return products
      .map(p => ({
        ...p,
        expiryMeta: getExpiryStatus(p.expiryDate)
      }))
      .filter(p => {
        const matchSearch = p.name.toLowerCase().includes(effectiveSearch) || p.sku.toLowerCase().includes(effectiveSearch);
        const matchType =
          filterType === 'All'
            ? true
            : filterType === 'Expired'
            ? p.expiryMeta.days < 0
            : filterType === 'Near Expiry'
            ? p.expiryMeta.days >= 0 && p.expiryMeta.days <= 30
            : p.expiryMeta.days > 30;
        return matchSearch && matchType;
      })
      .sort((a, b) => (a.expiryMeta.days || 999) - (b.expiryMeta.days || 999));
  }, [products, effectiveSearch, filterType]);

  // Wastage stats
  const expiredCount = products.filter(p => getExpiryStatus(p.expiryDate).days < 0).length;
  const nearExpiryCount = products.filter(p => {
    const days = getExpiryStatus(p.expiryDate).days;
    return days >= 0 && days <= 30;
  }).length;
  const totalWastageLoss = wastageRecords.reduce((acc, w) => acc + Number(w.costLost || 0), 0);

  const handleOpenWastage = (product = null) => {
    if (product) {
      setSelectedProductId(product.id);
      setWastageQty(String(product.currentStock));
    } else {
      const exp = products.find(p => getExpiryStatus(p.expiryDate).days < 0) || products[0];
      if (exp) {
        setSelectedProductId(exp.id);
        setWastageQty(String(exp.currentStock));
      }
    }
    setWastageReason('Expired shelf life prior to retail sale');
    setWastageError('');
    setIsWastageOpen(true);
  };

  const handleConfirmWastage = async (e) => {
    e.preventDefault();
    const qty = Number(wastageQty);
    const prod = products.find(p => p.id === selectedProductId);

    if (!qty || qty <= 0) {
      setWastageError('Please enter a valid positive quantity.');
      return;
    }
    if (prod && qty > prod.currentStock) {
      setWastageError(`Cannot write off ${qty} units. Only ${prod.currentStock} units exist.`);
      return;
    }

    const costLost = (prod ? prod.purchasePrice : 0) * qty;

    await recordWastage({
      productId: selectedProductId,
      productName: prod ? prod.name : 'Unknown Product',
      quantity: qty,
      costLost,
      reason: wastageReason,
      disposalMethod: 'Commercial segregation / bio-degradable disposal',
      authorizedBy: `${settings.currentUser.name} (${settings.currentUser.role})`
    });

    setIsWastageOpen(false);
  };

  const activeProduct = products.find(p => p.id === selectedProductId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Shelf Life & Expiry Tracking</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor perishable batches, proactively discount near-expiry items and write off wastage
          </p>
        </div>

        <button
          onClick={() => handleOpenWastage()}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 transition-all self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4" />
          Record Wastage Write-off
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-soft flex items-center gap-3">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Expired Batches</span>
            <span className="text-xl font-bold text-rose-600 dark:text-rose-400 block">{expiredCount} SKUs</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-soft flex items-center gap-3">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Expiring in &le; 30 Days</span>
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400 block">{nearExpiryCount} SKUs</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-soft flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <History className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Total Wastage Cost Written Off</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white block">
              {formatCurrency(totalWastageLoss, settings.store.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'inventory'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          Expiry Timeline & Status
        </button>
        <button
          onClick={() => setActiveTab('wastage')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'wastage'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          Wastage Records ({wastageRecords.length})
        </button>
      </div>

      {activeTab === 'inventory' ? (
        <>
          {/* Filters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-soft flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search perishable products by name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="Expired">Expired Only</option>
                <option value="Near Expiry">Near Expiry (&le; 30 Days)</option>
                <option value="Good">Good (&gt; 30 Days)</option>
              </select>
            </div>
          </div>

          {/* Expiry Products Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Product Name & SKU</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Batch Expiry Date</th>
                    <th className="py-3.5 px-4 text-center">Remaining Shelf Life</th>
                    <th className="py-3.5 px-4 text-center">Stock on Hand</th>
                    <th className="py-3.5 px-4 text-right">Potential Loss Value</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {categorizedProducts.map((p) => {
                    const potentialLoss = Number(p.currentStock) * Number(p.purchasePrice);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${p.expiryMeta.badgeClass}`}>
                            {p.expiryMeta.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 dark:text-white block">{p.name}</span>
                          <span className="font-mono text-[10px] text-slate-400">SKU: {p.sku}</span>
                        </td>
                        <td className="py-3 px-4">{p.category}</td>
                        <td className="py-3 px-4 font-mono font-medium">
                          {p.expiryDate ? formatDate(p.expiryDate) : 'Non-perishable'}
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          {p.expiryMeta.days < 0 ? (
                            <span className="text-rose-600 dark:text-rose-400">
                              Expired {Math.abs(p.expiryMeta.days)} days ago
                            </span>
                          ) : p.expiryMeta.days < 900 ? (
                            <span className={p.expiryMeta.days <= 30 ? 'text-amber-600' : 'text-emerald-600'}>
                              {p.expiryMeta.days} days left
                            </span>
                          ) : (
                            <span className="text-slate-400">Long shelf life</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-bold">{p.currentStock} units</td>
                        <td className="py-3 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                          {formatCurrency(potentialLoss, settings.store.currency)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenWastage(p)}
                            disabled={p.currentStock <= 0}
                            className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 disabled:opacity-40 rounded-lg transition-colors"
                          >
                            Write Off
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Wastage Records Tab */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Record ID</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4 text-center">Quantity Disposed</th>
                  <th className="py-3.5 px-4 text-right">Financial Loss</th>
                  <th className="py-3.5 px-4">Disposal Reason</th>
                  <th className="py-3.5 px-4">Authorized By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {wastageRecords.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{w.id}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{w.date}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{w.productName}</td>
                    <td className="py-3 px-4 text-center font-bold text-rose-600">{w.quantity} units</td>
                    <td className="py-3 px-4 text-right font-extrabold text-rose-600">
                      {formatCurrency(w.costLost, settings.store.currency)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{w.reason}</td>
                    <td className="py-3 px-4 text-slate-500 font-medium">{w.authorizedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Wastage Modal */}
      <Modal
        isOpen={isWastageOpen}
        onClose={() => setIsWastageOpen(false)}
        title="Record Inventory Wastage & Loss Write-off"
        subtitle="Deducts expired or spoiled products from active ledger and commits disposal log"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleConfirmWastage} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Product *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                const prod = products.find(p => p.id === e.target.value);
                if (prod) setWastageQty(String(prod.currentStock));
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stock: {p.currentStock})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Quantity to Dispose * (Available: {activeProduct?.currentStock})
            </label>
            <input
              type="number"
              min="1"
              max={activeProduct?.currentStock}
              value={wastageQty}
              onChange={(e) => setWastageQty(e.target.value)}
              placeholder="e.g. 10"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Disposal Reason & Audit Justification
            </label>
            <input
              type="text"
              value={wastageReason}
              onChange={(e) => setWastageReason(e.target.value)}
              placeholder="e.g. Expiry date passed prior to sale"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          {activeProduct && wastageQty && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-xs text-rose-800 dark:text-rose-300">
              Estimated Financial Write-off Loss:{' '}
              <strong className="text-rose-600 dark:text-rose-400">
                {formatCurrency(Number(wastageQty) * Number(activeProduct.purchasePrice), settings.store.currency)}
              </strong>
            </div>
          )}

          {wastageError && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 rounded-xl text-xs">
              {wastageError}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsWastageOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-colors"
            >
              Confirm Disposal Write-off
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
