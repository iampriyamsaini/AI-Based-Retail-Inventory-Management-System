import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  PackageCheck,
  Truck,
  Trash2,
  Calendar,
  AlertCircle,
  Eye
} from 'lucide-react';

export const PurchaseOrders = () => {
  const { purchaseOrders, suppliers, products, createPurchaseOrder, updatePOStatus, receivePOItems, settings, globalSearchQuery } = useApp();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);

  // Create PO Form State
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState([
    { productId: products[0]?.id || '', quantity: 20, unitCost: products[0]?.purchasePrice || 50 }
  ]);
  const [formError, setFormError] = useState('');

  // Receive Stock state: map of productId -> quantity being received right now
  const [receiveInputs, setReceiveInputs] = useState({});

  const effectiveSearch = (search || globalSearchQuery).toLowerCase();

  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchSearch =
        po.poNumber.toLowerCase().includes(effectiveSearch) ||
        po.supplierName.toLowerCase().includes(effectiveSearch);
      const matchStatus = selectedStatus === 'All' || po.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [purchaseOrders, effectiveSearch, selectedStatus]);

  // Handle Add Item to new PO
  const handleAddItem = () => {
    setOrderItems(prev => [
      ...prev,
      { productId: products[0]?.id || '', quantity: 10, unitCost: products[0]?.purchasePrice || 50 }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (orderItems.length <= 1) return;
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setOrderItems(prev => {
      const updated = [...prev];
      if (field === 'productId') {
        const prod = products.find(p => p.id === value);
        updated[index] = {
          ...updated[index],
          productId: value,
          unitCost: prod ? prod.purchasePrice : 50
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const calculatedPOTotal = useMemo(() => {
    return orderItems.reduce((acc, item) => acc + (Number(item.quantity || 0) * Number(item.unitCost || 0)), 0);
  }, [orderItems]);

  const handleOpenCreate = () => {
    setSupplierId(suppliers[0]?.id || '');
    const d = new Date();
    d.setDate(d.getDate() + 4);
    setExpectedDelivery(d.toISOString().split('T')[0]);
    setNotes('Regular store replenishment batch');
    setOrderItems([
      { productId: products[0]?.id || '', quantity: 25, unitCost: products[0]?.purchasePrice || 50 }
    ]);
    setFormError('');
    setIsCreateOpen(true);
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    if (!supplierId) {
      setFormError('Please choose a supplier.');
      return;
    }
    if (orderItems.length === 0) {
      setFormError('Add at least one line item.');
      return;
    }

    const supplierObj = suppliers.find(s => s.id === supplierId);

    const items = orderItems.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        name: prod ? prod.name : 'Unknown Product',
        quantity: Number(item.quantity),
        unitCost: Number(item.unitCost),
        totalCost: Number(item.quantity) * Number(item.unitCost),
        receivedQuantity: 0
      };
    });

    await createPurchaseOrder({
      supplierId,
      supplierName: supplierObj ? supplierObj.name : 'Supplier',
      expectedDelivery,
      notes,
      totalAmount: calculatedPOTotal,
      items
    });

    setIsCreateOpen(false);
  };

  const handleOpenReceive = (po) => {
    setSelectedPO(po);
    const initialInputs = {};
    po.items.forEach(item => {
      const remaining = Number(item.quantity) - Number(item.receivedQuantity || 0);
      initialInputs[item.productId] = remaining > 0 ? remaining : 0;
    });
    setReceiveInputs(initialInputs);
    setIsReceiveOpen(true);
  };

  const handleConfirmReceive = async () => {
    if (!selectedPO) return;
    await receivePOItems(selectedPO.id, receiveInputs);
    setIsReceiveOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Purchase Order Management</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Issue procurement orders, track supplier status, and record partial/full goods receipt
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Purchase Order
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-soft flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by PO number or supplier name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Partially Received">Partially Received</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Purchase Orders Table */}
      {filteredPOs.length === 0 ? (
        <EmptyState
          title="No purchase orders found"
          description="Create your first procurement order to replenish retail inventory."
          actionLabel="Create PO"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">PO Number</th>
                  <th className="py-3.5 px-4">Supplier</th>
                  <th className="py-3.5 px-4">Order Date</th>
                  <th className="py-3.5 px-4">Expected Delivery</th>
                  <th className="py-3.5 px-4 text-center">Items</th>
                  <th className="py-3.5 px-4 text-right">Total Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredPOs.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {po.poNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      {po.supplierName}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(po.orderDate)}</td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(po.expectedDelivery)}</td>
                    <td className="py-3 px-4 text-center font-bold">{po.items.length} Lines</td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(po.totalAmount, settings.store.currency)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge size="sm">{po.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedPO(po);
                            setIsDetailOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Status workflow buttons */}
                        {po.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => updatePOStatus(po.id, 'Approved')}
                              className="px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 rounded-lg"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updatePOStatus(po.id, 'Rejected')}
                              className="px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 rounded-lg"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {(po.status === 'Approved' || po.status === 'Partially Received') && (
                          <button
                            onClick={() => handleOpenReceive(po)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            Receive Stock
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create PO Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Issue Purchase Order"
        subtitle="Specify vendor and line items to replenish warehouse inventory"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Supplier *
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.leadTime}d lead time)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Order Line Items
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {orderItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <div className="flex-1">
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs truncate"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Stock: {p.currentStock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      placeholder="Qty"
                      className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-center"
                    />
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitCost}
                      onChange={(e) => handleItemChange(idx, 'unitCost', e.target.value)}
                      placeholder="Unit ₹"
                      className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-right"
                    />
                  </div>

                  <div className="w-24 text-right font-bold text-slate-900 dark:text-white">
                    {formatCurrency(Number(item.quantity) * Number(item.unitCost), settings.store.currency)}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    disabled={orderItems.length <= 1}
                    className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm font-bold text-slate-900 dark:text-white">
              <span>Total Estimated Cost</span>
              <span className="text-blue-600 dark:text-blue-400 text-base">
                {formatCurrency(calculatedPOTotal, settings.store.currency)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Procurement Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Expedited freight required for dairy replenishment"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          {formError && (
            <div className="flex items-center gap-2 p-2.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
            >
              Submit Order
            </button>
          </div>
        </form>
      </Modal>

      {/* PO Detail Modal */}
      {selectedPO && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Purchase Order ${selectedPO.poNumber}`}
          subtitle={`Supplier: ${selectedPO.supplierName}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">
                Created: <strong>{formatDate(selectedPO.orderDate)}</strong>
              </span>
              <Badge size="sm">{selectedPO.status}</Badge>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
              <p>Expected Delivery: <strong>{formatDate(selectedPO.expectedDelivery)}</strong></p>
              <p>Delivered Date: <strong>{selectedPO.deliveredDate ? formatDate(selectedPO.deliveredDate) : 'Pending Delivery'}</strong></p>
              <p>Notes: <em>{selectedPO.notes || 'None'}</em></p>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Order Line Items</h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                {selectedPO.items.map((item, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{item.name}</span>
                      <span className="text-[10px] text-slate-400">
                        Ordered: {item.quantity} | Received: {item.receivedQuantity || 0}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {formatCurrency(item.totalCost, settings.store.currency)}
                      </span>
                      <span className="text-[10px] text-slate-400">{formatCurrency(item.unitCost, settings.store.currency)} / unit</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 font-bold text-sm">
              <span>Total PO Value:</span>
              <span className="text-blue-600 dark:text-blue-400 text-base">
                {formatCurrency(selectedPO.totalAmount, settings.store.currency)}
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* Receive Stock Modal (Supports Full & Partial Receiving) */}
      {selectedPO && (
        <Modal
          isOpen={isReceiveOpen}
          onClose={() => setIsReceiveOpen(false)}
          title={`Receive Inward Goods — ${selectedPO.poNumber}`}
          subtitle="Enter the verified quantities received at receiving dock. Product inventory balances will increment immediately."
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-800 dark:text-blue-300">
              Entering received quantities will automatically log Stock In transactions and increment active retail inventory counts.
            </div>

            <div className="space-y-3">
              {selectedPO.items.map((item) => {
                const totalOrdered = Number(item.quantity);
                const previouslyReceived = Number(item.receivedQuantity || 0);
                const remaining = totalOrdered - previouslyReceived;

                return (
                  <div
                    key={item.productId}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white truncate">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Ordered: {totalOrdered} | Already Received: {previouslyReceived} | Remaining: {remaining}
                      </p>
                    </div>

                    <div className="w-24 shrink-0">
                      <label className="text-[9px] font-bold text-slate-500 uppercase block mb-0.5">
                        Inward Qty
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={remaining}
                        value={receiveInputs[item.productId] ?? 0}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value));
                          setReceiveInputs(prev => ({ ...prev, [item.productId]: val }));
                        }}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-center"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsReceiveOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReceive}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-colors"
              >
                Confirm Goods Inward
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
