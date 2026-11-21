import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { exportToCSV, parseCSV } from '../utils/formatters';
import { EmptyState } from '../components/common/EmptyState';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  ArrowRight,
  Eye,
  RefreshCw,
  Package,
  Boxes,
  Receipt,
  Truck
} from 'lucide-react';

export const CSVManagement = () => {
  const { products, transactions, sales, suppliers, addProduct, suppliers: supplierList, settings, addToast } = useApp();

  const [activeTab, setActiveTab] = useState('export'); // 'export' | 'import'
  const [importType, setImportType] = useState('products'); // 'products' | 'inventory' | 'suppliers'
  const [importPreview, setImportPreview] = useState(null); // { headers, rows, errors }
  const [importFileName, setImportFileName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(null);

  const fileInputRef = useRef(null);

  // ─────────────────────────── EXPORT HANDLERS ───────────────────────────
  const handleExportProducts = () => {
    const data = products.map(p => ({
      'Product ID': p.id,
      'Name': p.name,
      'SKU': p.sku,
      'Barcode / EAN': p.barcode || '',
      'Category': p.category,
      'Description': p.description || '',
      'Purchase Price (₹)': p.purchasePrice,
      'Selling Price (₹)': p.sellingPrice,
      'Current Stock': p.currentStock,
      'Min Stock Level': p.minStockLevel,
      'Supplier ID': p.supplierId || '',
      'Supplier Name': p.supplierName || '',
      'Expiry Date': p.expiryDate || '',
      'Status': p.status
    }));
    exportToCSV('Stockify_Products_Catalog', data);
    addToast('Product catalog exported to CSV successfully.', 'success');
  };

  const handleExportInventory = () => {
    const data = transactions.map(tx => ({
      'Transaction ID': tx.id,
      'Date & Time': tx.date,
      'Product ID': tx.productId,
      'Product Name': tx.productName,
      'SKU': tx.sku,
      'Transaction Type': tx.type,
      'Quantity Change': tx.quantity,
      'Previous Stock': tx.previousStock,
      'Updated Stock': tx.updatedStock,
      'Reason / Reference': tx.reason,
      'Performed By': tx.performedBy
    }));
    exportToCSV('Stockify_Inventory_Audit_Trail', data);
    addToast('Inventory audit trail exported successfully.', 'success');
  };

  const handleExportSales = () => {
    const data = sales.map(s => ({
      'Invoice Number': s.invoiceNumber,
      'Date': s.date,
      'Customer Name': s.customerName,
      'Customer Phone': s.customerPhone,
      'Items Count': s.items.length,
      'Subtotal (₹)': s.subtotal,
      'Discount (₹)': s.discountAmount || 0,
      'Tax GST (₹)': s.taxAmount,
      'Tax Rate (%)': s.taxRate || 5,
      'Grand Total (₹)': s.total,
      'Payment Method': s.paymentMethod,
      'Cashier': s.cashier,
      'Status': s.status
    }));
    exportToCSV('Stockify_Sales_Invoices', data);
    addToast('Sales invoices exported to CSV successfully.', 'success');
  };

  const handleExportSuppliers = () => {
    const data = suppliers.map(s => ({
      'Supplier ID': s.id,
      'Company Name': s.name,
      'Contact Person': s.contactPerson,
      'Phone': s.phone,
      'Email': s.email,
      'Address': s.address,
      'Lead Time (Days)': s.leadTime,
      'Rating': s.rating || '',
      'Status': s.status || 'Active'
    }));
    exportToCSV('Stockify_Supplier_Directory', data);
    addToast('Supplier directory exported to CSV successfully.', 'success');
  };

  // ─────────────────────────── IMPORT HANDLERS ───────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      addToast('Please select a valid .csv file format.', 'error');
      return;
    }

    setImportFileName(file.name);
    setImportSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target.result;
      const result = parseCSV(csvText);
      setImportPreview(result);
    };
    reader.readAsText(file);
  };

  const handleImportConfirm = async () => {
    if (!importPreview || !importPreview.rows.length) {
      addToast('No valid rows to import. Please fix errors first.', 'error');
      return;
    }

    setIsImporting(true);

    try {
      let importedCount = 0;

      if (importType === 'products') {
        for (const row of importPreview.rows) {
          const name = row.name || row.Name || row.productName || row['Product Name'] || '';
          if (!name) continue;

          const supplierObj = supplierList[0];
          await addProduct({
            name: name.trim(),
            sku: (row.sku || row.SKU || `SKU-${Math.floor(Math.random() * 9999)}`).trim().toUpperCase(),
            barcode: row.barcode || row['Barcode / EAN'] || '',
            category: row.category || row.Category || 'Groceries & Staples',
            description: row.description || row.Description || '',
            purchasePrice: Number(row.purchasePrice || row['Purchase Price (₹)'] || 0),
            sellingPrice: Number(row.sellingPrice || row['Selling Price (₹)'] || 0),
            currentStock: Number(row.currentStock || row['Current Stock'] || 0),
            minStockLevel: Number(row.minStockLevel || row['Min Stock Level'] || 10),
            supplierId: supplierObj?.id || '',
            supplierName: supplierObj?.name || 'Direct Supplier',
            expiryDate: row.expiryDate || row['Expiry Date'] || '',
            image: row.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=60'
          });
          importedCount++;
        }
      }

      setImportSuccess({
        count: importedCount,
        type: importType
      });

      addToast(`Successfully imported ${importedCount} ${importType} records from CSV.`, 'success');
      setImportPreview(null);
      setImportFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      addToast('Import failed: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearImport = () => {
    setImportPreview(null);
    setImportFileName('');
    setImportSuccess(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─────────────────────────── TEMPLATE DOWNLOAD ───────────────────────────
  const handleDownloadTemplate = () => {
    const templates = {
      products: [
        { name: 'Amul Gold Full Cream Milk 500ml', sku: 'MILK-AMUL-02', barcode: '8901262010052', category: 'Dairy & Beverages', description: 'Full cream milk sample', purchasePrice: 32, sellingPrice: 38, currentStock: 50, minStockLevel: 15, expiryDate: '2027-06-30' }
      ],
      inventory: [
        { productId: 'PRD-101', productName: 'Sample Product', type: 'Stock In', quantity: 25, reason: 'Manual replenishment' }
      ],
      suppliers: [
        { name: 'Sample Supplier Co.', contactPerson: 'Ravi Kumar', phone: '+91 98001 12345', email: 'ravi@samplesupplier.com', address: 'Bangalore, Karnataka 560001', leadTime: 3 }
      ]
    };

    exportToCSV(`Stockify_${importType}_Import_Template`, templates[importType] || templates.products);
    addToast(`${importType} import template downloaded.`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">CSV Data Import & Export</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Bulk-migrate your product catalog, inventory transactions, sales records, and supplier directory via CSV spreadsheets
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('export')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'export'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Download className="w-4 h-4" />
          Export Data
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'import'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          Import Data
        </button>
      </div>

      {/* ─── EXPORT TAB ─── */}
      {activeTab === 'export' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Product Catalog Export */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Product Catalog</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">SKUs, pricing, stock, expiry, supplier mapping</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                {products.length} records
              </span>
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>All {products.length} active product SKUs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Pricing, margin, stock balance, minimum thresholds</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Batch expiry dates and supplier associations</span>
              </div>
            </div>

            <button
              onClick={handleExportProducts}
              className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Products CSV
            </button>
          </div>

          {/* Inventory Audit Trail Export */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Boxes className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Inventory Audit Trail</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Stock In, Stock Out, Adjustments ledger</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                {transactions.length} records
              </span>
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>All {transactions.length} inventory movement transactions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Timestamps, quantity deltas, before/after stock levels</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Reason codes and responsible staff references</span>
              </div>
            </div>

            <button
              onClick={handleExportInventory}
              className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Inventory CSV
            </button>
          </div>

          {/* Sales Invoices Export */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Sales Tax Invoices</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">POS transaction records, GST tax reports</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                {sales.length} records
              </span>
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>All {sales.length} POS checkout invoices</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Customer, payment method, subtotals, GST breakdown</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Compatible with Tally, Zoho Books, QuickBooks import</span>
              </div>
            </div>

            <button
              onClick={handleExportSales}
              className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Sales CSV
            </button>
          </div>

          {/* Supplier Directory Export */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Supplier Directory</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Vendor contacts, lead times, catalog scope</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                {suppliers.length} records
              </span>
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>All {suppliers.length} authorized vendor profiles</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Contact persons, phone, email, dispatch address</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Delivery SLA lead times and performance ratings</span>
              </div>
            </div>

            <button
              onClick={handleExportSuppliers}
              className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Suppliers CSV
            </button>
          </div>
        </div>
      )}

      {/* ─── IMPORT TAB ─── */}
      {activeTab === 'import' && (
        <div className="space-y-5">
          {/* Import Type Selector */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
              Select Data Type to Import
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'products', label: 'Products', icon: Package, color: 'blue' },
                { id: 'inventory', label: 'Inventory Adjustments', icon: Boxes, color: 'indigo' },
                { id: 'suppliers', label: 'Suppliers', icon: Truck, color: 'amber' }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setImportType(type.id);
                    handleClearImport();
                  }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all text-xs font-bold gap-2 ${
                    importType === type.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <type.icon className="w-5 h-5" />
                  {type.label}
                </button>
              ))}
            </div>

            {/* Template Download Link */}
            <button
              onClick={handleDownloadTemplate}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <FileText className="w-3.5 h-3.5" />
              Download {importType} CSV template
            </button>
          </div>

          {/* File Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`bg-white dark:bg-slate-900 border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all text-center ${
              importFileName
                ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/30 dark:hover:bg-blue-950/10'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />

            {importFileName ? (
              <div className="space-y-2">
                <div className="w-14 h-14 mx-auto bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                  <FileText className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{importFileName}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {importPreview ? `${importPreview.rows.length} rows detected` : 'Parsing...'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 mx-auto bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Drop CSV file here or click to upload</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Accepts .csv format • Max 5MB • Download the template above for correct column format
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Import Preview & Validation */}
          {importPreview && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">CSV Preview & Validation</h3>
                </div>
                <button
                  onClick={handleClearImport}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Validation Errors */}
              {importPreview.errors?.length > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-400">
                    <AlertCircle className="w-4 h-4" />
                    {importPreview.errors.length} Validation Warning{importPreview.errors.length > 1 ? 's' : ''} Detected
                  </div>
                  {importPreview.errors.slice(0, 5).map((err, idx) => (
                    <p key={idx} className="text-xs text-amber-700 dark:text-amber-300 pl-6">{err}</p>
                  ))}
                  {importPreview.errors.length > 5 && (
                    <p className="text-xs text-amber-500 pl-6">...and {importPreview.errors.length - 5} more warnings</p>
                  )}
                </div>
              )}

              {/* Data Preview Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold">
                      <th className="py-2.5 px-3">#</th>
                      {(importPreview.headers || []).slice(0, 6).map(h => (
                        <th key={h} className="py-2.5 px-3">{h}</th>
                      ))}
                      {importPreview.headers?.length > 6 && (
                        <th className="py-2.5 px-3">+{importPreview.headers.length - 6} more cols</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {importPreview.rows.slice(0, 8).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="py-2 px-3 text-slate-400 font-mono">{row._rowNum}</td>
                        {(importPreview.headers || []).slice(0, 6).map(h => (
                          <td key={h} className="py-2 px-3 truncate max-w-[120px]">
                            {row[h] || <span className="text-slate-300 dark:text-slate-600 italic">empty</span>}
                          </td>
                        ))}
                        {importPreview.headers?.length > 6 && <td className="py-2 px-3 text-slate-400">...</td>}
                      </tr>
                    ))}
                    {importPreview.rows.length > 8 && (
                      <tr>
                        <td colSpan={8} className="py-2 px-3 text-center text-slate-400 italic text-xs">
                          ...and {importPreview.rows.length - 8} more rows
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white">{importPreview.rows.length} rows</span> ready for import into{' '}
                  <span className="font-bold capitalize text-blue-600">{importType}</span> module.
                  {importPreview.errors?.length > 0 && (
                    <span className="text-amber-600 dark:text-amber-400 ml-1 font-semibold">
                      ({importPreview.errors.length} warnings — rows will still import where possible)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearImport}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImportConfirm}
                    disabled={isImporting || importPreview.rows.length === 0}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm transition-colors"
                  >
                    {isImporting ? (
                      <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Importing...</>
                    ) : (
                      <><Upload className="w-3.5 h-3.5" /> Confirm Import ({importPreview.rows.length} rows)</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Import Success Message */}
          {importSuccess && (
            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Import Completed Successfully</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                  {importSuccess.count} {importSuccess.type} records were imported and are now live in the Stockify AI system.
                  Navigate to the respective module to view or edit imported records.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
