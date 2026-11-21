import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import {
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
  History,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const Inventory = () => {
  const { products, transactions, performStockIn, performStockOut, performStockAdjustment, settings, globalSearchQuery } = useApp();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'history'
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [historyTypeFilter, setHistoryTypeFilter] = useState('All');

  // Modals for Stock operations
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [isStockOutOpen, setIsStockOutOpen] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);

  // Form states
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantityInput, setQuantityInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const effectiveSearch = (search || globalSearchQuery).toLowerCase();

  // Selected product object for current modal operation
  const activeProduct = products.find(p => p.id === selectedProductId) || products[0];

  // Filtered inventory products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(effectiveSearch) ||
        p.sku.toLowerCase().includes(effectiveSearch);
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, effectiveSearch, selectedCategory]);

  // Filtered transactions history
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch =
        tx.productName.toLowerCase().includes(effectiveSearch) ||
        tx.sku.toLowerCase().includes(effectiveSearch) ||
        tx.reason.toLowerCase().includes(effectiveSearch);
      const matchType = historyTypeFilter === 'All' || tx.type === historyTypeFilter;
      return matchSearch && matchType;
    });
  }, [transactions, effectiveSearch, historyTypeFilter]);

  // Operation Handlers
  const handleOpenStockIn = (product = null) => {
    if (product) setSelectedProductId(product.id);
    else if (!selectedProductId && products.length) setSelectedProductId(products[0].id);
    setQuantityInput('');
    setReasonInput('Regular supplier delivery replenishment');
    setErrorMsg('');
    setIsStockInOpen(true);
  };

  const handleOpenStockOut = (product = null) => {
    if (product) setSelectedProductId(product.id);
    else if (!selectedProductId && products.length) setSelectedProductId(products[0].id);
    setQuantityInput('');
    setReasonInput('Store usage / department requisition');
    setErrorMsg('');
    setIsStockOutOpen(true);
  };

  const handleOpenAdjustment = (product = null) => {
    if (product) {
      setSelectedProductId(product.id);
      setQuantityInput(String(product.currentStock));
    } else {
      const p = products.find(i => i.id === selectedProductId) || products[0];
      if (p) setQuantityInput(String(p.currentStock));
    }
    setReasonInput('Physical inventory audit cycle count reconciliation');
    setErrorMsg('');
    setIsAdjustmentOpen(true);
  };

  const submitStockIn = async (e) => {
    e.preventDefault();
    const qty = Number(quantityInput);
    if (!qty || qty <= 0) {
      setErrorMsg('Please enter a valid positive quantity.');
      return;
    }
    await performStockIn({
      productId: selectedProductId,
      quantity: qty,
      reason: reasonInput
    });
    setIsStockInOpen(false);
  };

  const submitStockOut = async (e) => {
    e.preventDefault();
    const qty = Number(quantityInput);
    if (!qty || qty <= 0) {
      setErrorMsg('Please enter a valid positive quantity.');
      return;
    }
    if (activeProduct && qty > activeProduct.currentStock) {
      setErrorMsg(`Cannot remove ${qty} units. Only ${activeProduct.currentStock} units currently available.`);
      return;
    }
    await performStockOut({
      productId: selectedProductId,
      quantity: qty,
      reason: reasonInput
    });
    setIsStockOutOpen(false);
  };

  const submitAdjustment = async (e) => {
    e.preventDefault();
    if (quantityInput === '' || Number(quantityInput) < 0) {
      setErrorMsg('Please enter a valid non-negative stock count.');
      return;
    }
    await performStockAdjustment({
      productId: selectedProductId,
      updatedQuantity: Number(quantityInput),
      reason: reasonInput
    });
    setIsAdjustmentOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Inventory Management</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time stock balance, inward/outward adjustments and full immutable audit history
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleOpenStockIn()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 transition-colors shadow-xs"
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
            Stock In
          </button>
          <button
            onClick={() => handleOpenStockOut()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl hover:bg-rose-100 transition-colors shadow-xs"
          >
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
            Stock Out
          </button>
          <button
            onClick={() => handleOpenAdjustment()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 transition-colors shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            Audit Adjust
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'all'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4" />
          Stock Ledger ({products.length} Items)
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          Audit Trail History ({transactions.length} Records)
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-soft flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeTab === 'all' ? "Search SKU or product name..." : "Search product, SKU, or transaction reason..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {activeTab === 'all' ? (
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Categories</option>
              {Array.from(new Set(products.map(p => p.category))).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={historyTypeFilter}
              onChange={(e) => setHistoryTypeFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Transaction Types</option>
              <option value="Stock In">Stock In</option>
              <option value="Stock Out">Stock Out</option>
              <option value="Stock Adjustment">Stock Adjustment</option>
            </select>
          </div>
        )}
      </div>

      {/* Content based on Active Tab */}
      {activeTab === 'all' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Item & SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-center">Available Stock</th>
                  <th className="py-3.5 px-4 text-center">Min Safety Level</th>
                  <th className="py-3.5 px-4 text-right">Inventory Value</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Quick Stock Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredProducts.map((p) => {
                  const val = Number(p.currentStock) * Number(p.purchasePrice);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 dark:text-white block truncate max-w-xs">
                              {p.name}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">SKU: {p.sku}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-extrabold text-sm ${
                            Number(p.currentStock) === 0
                              ? 'text-rose-600 dark:text-rose-400'
                              : Number(p.currentStock) <= Number(p.minStockLevel)
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {p.currentStock}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-slate-500">
                        {p.minStockLevel} units
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(val, settings.store.currency)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge size="sm">{p.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenStockIn(p)}
                            className="px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 rounded-lg transition-colors"
                          >
                            + In
                          </button>
                          <button
                            onClick={() => handleOpenStockOut(p)}
                            disabled={p.currentStock <= 0}
                            className="px-2 py-1 text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
                          >
                            - Out
                          </button>
                          <button
                            onClick={() => handleOpenAdjustment(p)}
                            className="px-2 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            Adjust
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* History Audit Trail Tab */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Product & SKU</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-center">Change</th>
                  <th className="py-3.5 px-4 text-center">Stock Path (Prev → New)</th>
                  <th className="py-3.5 px-4">Reason / Source</th>
                  <th className="py-3.5 px-4">Performed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500">{tx.date}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block truncate max-w-xs">
                        {tx.productName}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">{tx.sku}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge size="sm">{tx.type}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-bold ${
                          tx.type === 'Stock In'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : tx.type === 'Stock Out'
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {tx.type === 'Stock In'
                          ? `+${tx.quantity}`
                          : tx.type === 'Stock Out'
                          ? `-${tx.quantity}`
                          : `${tx.quantity > 0 ? '+' : ''}${tx.quantity}`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span className="text-slate-400">{tx.previousStock}</span>
                      <span className="mx-1 text-slate-400">→</span>
                      <span className="font-bold text-slate-900 dark:text-white">{tx.updatedStock}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {tx.reason}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium">{tx.performedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock In Modal */}
      <Modal
        isOpen={isStockInOpen}
        onClose={() => setIsStockInOpen(false)}
        title="Record Stock In (Inward Inventory)"
        subtitle="Adds received physical inventory directly to available product balance"
        maxWidth="max-w-md"
      >
        <form onSubmit={submitStockIn} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Product *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Current: {p.currentStock})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Quantity to Inward *
            </label>
            <input
              type="number"
              min="1"
              value={quantityInput}
              onChange={(e) => setQuantityInput(e.target.value)}
              placeholder="e.g. 50"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Inward Reason / Delivery Note
            </label>
            <input
              type="text"
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              placeholder="e.g. Supplier delivery consignment receipt"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsStockInOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
            >
              Confirm Stock In
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock Out Modal */}
      <Modal
        isOpen={isStockOutOpen}
        onClose={() => setIsStockOutOpen(false)}
        title="Record Stock Out (Outward Inventory)"
        subtitle="Deducts stock for internal department consumption, sample dispatch or store transfers"
        maxWidth="max-w-md"
      >
        <form onSubmit={submitStockOut} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Product *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Available: {p.currentStock})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Quantity to Deduct * (Max: {activeProduct?.currentStock})
            </label>
            <input
              type="number"
              min="1"
              max={activeProduct?.currentStock}
              value={quantityInput}
              onChange={(e) => setQuantityInput(e.target.value)}
              placeholder="e.g. 10"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Stock Out Reason
            </label>
            <input
              type="text"
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              placeholder="e.g. Department internal transfer or sampling"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsStockOutOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
            >
              Confirm Stock Out
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={isAdjustmentOpen}
        onClose={() => setIsAdjustmentOpen(false)}
        title="Physical Inventory Audit Adjustment"
        subtitle="Directly corrects ledger count to match physical shelf count verified by auditor"
        maxWidth="max-w-md"
      >
        <form onSubmit={submitAdjustment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Product *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                const p = products.find(prod => prod.id === e.target.value);
                if (p) setQuantityInput(String(p.currentStock));
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Current: {p.currentStock})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-xs text-blue-800 dark:text-blue-300">
            Current system stock: <strong>{activeProduct?.currentStock} units</strong>. Entering a new value will overwrite the recorded balance and log an adjustment delta.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Actual Verified Physical Count *
            </label>
            <input
              type="number"
              min="0"
              value={quantityInput}
              onChange={(e) => setQuantityInput(e.target.value)}
              placeholder="e.g. 45"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Audit Discrepancy Reason *
            </label>
            <input
              type="text"
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              placeholder="e.g. Monthly physical audit count adjustment"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsAdjustmentOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
            >
              Save Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
