import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import {
  Receipt,
  Search,
  Filter,
  Eye,
  Printer,
  Calendar,
  CreditCard,
  CircleDollarSign,
  TrendingUp,
  Download
} from 'lucide-react';
import { exportToCSV } from '../utils/formatters';

export const Sales = () => {
  const { sales, settings, globalSearchQuery } = useApp();

  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('All');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const effectiveSearch = (search || globalSearchQuery).toLowerCase();

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const matchSearch =
        s.invoiceNumber.toLowerCase().includes(effectiveSearch) ||
        s.customerName.toLowerCase().includes(effectiveSearch) ||
        (s.customerPhone && s.customerPhone.includes(effectiveSearch));
      const matchPayment = selectedPayment === 'All' || s.paymentMethod.toLowerCase().includes(selectedPayment.toLowerCase());
      return matchSearch && matchPayment;
    });
  }, [sales, effectiveSearch, selectedPayment]);

  // Summary Metrics
  const summary = useMemo(() => {
    const totalRev = sales.reduce((acc, s) => acc + Number(s.total || 0), 0);
    const totalTax = sales.reduce((acc, s) => acc + Number(s.taxAmount || 0), 0);
    const avgTicket = sales.length ? totalRev / sales.length : 0;
    return { totalRev, totalTax, avgTicket, count: sales.length };
  }, [sales]);

  const handleExportCSV = () => {
    const exportData = sales.map(s => ({
      'Invoice Number': s.invoiceNumber,
      'Date': s.date,
      'Customer': s.customerName,
      'Phone': s.customerPhone,
      'Items Count': s.items.length,
      'Subtotal': s.subtotal,
      'Discount': s.discountAmount,
      'Tax (GST)': s.taxAmount,
      'Total Amount': s.total,
      'Payment Method': s.paymentMethod,
      'Cashier': s.cashier
    }));
    exportToCSV('Stockify_Sales_Invoices', exportData);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sales & Tax Invoices</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit historical POS transactions, GST tax filings and customer receipt archive
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 shadow-xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          Export Sales CSV
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-soft">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Total Sales Volume</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">{summary.count} Receipts</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-soft">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Gross Sales Revenue</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {formatCurrency(summary.totalRev, settings.store.currency)}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-soft">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">GST Tax Collected</span>
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1 block">
            {formatCurrency(summary.totalTax, settings.store.currency)}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-soft">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Average Ticket Size</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
            {formatCurrency(summary.avgTicket, settings.store.currency)}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-soft flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice number or customer name/phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Payment Modes</option>
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      {filteredSales.length === 0 ? (
        <EmptyState
          title="No sales records match criteria"
          description="Invoices created in the POS register will automatically be cataloged here."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4 text-center">Items</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4 text-right">Tax (GST)</th>
                  <th className="py-3.5 px-4 text-right">Total Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {s.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{s.date}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {s.customerName}
                      </span>
                      <span className="text-[10px] text-slate-400">{s.customerPhone}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold">{s.items.length}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium text-[11px]">
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-500">
                      {formatCurrency(s.taxAmount, settings.store.currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(s.total, settings.store.currency)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge size="sm">{s.status || 'Completed'}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedInvoice(s);
                          setIsDetailOpen(true);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition-colors"
                        title="View & Print Invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Invoice ${selectedInvoice.invoiceNumber}`}
          subtitle={`Processed on ${selectedInvoice.date} by ${selectedInvoice.cashier}`}
          maxWidth="max-w-md"
        >
          <div id="printable-receipt" className="space-y-4 text-xs font-mono text-slate-800">
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h2 className="text-base font-extrabold uppercase">{settings.store.name}</h2>
              <p className="text-[11px] text-slate-600">{settings.store.address}</p>
              <p className="text-[11px] text-slate-600">GSTIN: {settings.store.gstNumber}</p>
              <div className="mt-2 text-[10px] text-slate-500">
                <span>Invoice: {selectedInvoice.invoiceNumber}</span> • <span>Date: {selectedInvoice.date}</span>
              </div>
            </div>

            <div className="text-[11px] pb-2 border-b border-dashed border-slate-300">
              <p>Customer: <strong>{selectedInvoice.customerName}</strong></p>
              <p>Contact: {selectedInvoice.customerPhone}</p>
              <p>Payment: {selectedInvoice.paymentMethod}</p>
              <p>Cashier: {selectedInvoice.cashier}</p>
            </div>

            <div className="py-2 border-b border-dashed border-slate-300 space-y-1.5">
              <div className="flex justify-between font-bold text-[11px]">
                <span>Item</span>
                <span>Qty x Price</span>
                <span>Total</span>
              </div>
              {selectedInvoice.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span className="truncate max-w-[150px]">{item.name}</span>
                  <span>{item.quantity} x {item.price}</span>
                  <span>{formatCurrency(item.total, settings.store.currency)}</span>
                </div>
              ))}
            </div>

            <div className="py-2 border-b border-dashed border-slate-300 space-y-1 text-right text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(selectedInvoice.subtotal, settings.store.currency)}</span>
              </div>
              {selectedInvoice.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount:</span>
                  <span>- {formatCurrency(selectedInvoice.discountAmount, settings.store.currency)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax GST ({selectedInvoice.taxRate || 5}%):</span>
                <span>+ {formatCurrency(selectedInvoice.taxAmount, settings.store.currency)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-400">
                <span>Grand Total:</span>
                <span>{formatCurrency(selectedInvoice.total, settings.store.currency)}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-500 pt-2 space-y-1">
              <p>{settings.store.receiptHeader}</p>
              <p>{settings.store.receiptFooter}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsDetailOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Duplicate Receipt
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
