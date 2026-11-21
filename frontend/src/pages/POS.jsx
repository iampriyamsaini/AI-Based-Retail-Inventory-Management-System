import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Receipt,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  Printer,
  CheckCircle2,
  AlertCircle,
  ScanBarcode,
  PackageOpen
} from 'lucide-react';
import { INITIAL_CATEGORIES } from '../data/mockData';

export const POS = () => {
  const { products, cart, addToCart, updateCartQty, removeFromCart, clearCart, completeSale, settings } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(settings.store.taxRate || 5);
  const [paymentMethod, setPaymentMethod] = useState('UPI (Google Pay / PhonePe)');

  // Completed Invoice Modal state
  const [lastInvoice, setLastInvoice] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter products for POS Grid
  const availableProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode && p.barcode.includes(search));
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, search, selectedCategory]);

  // Cart Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.sellingPrice * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return (subtotal * Number(discountPercent)) / 100;
  }, [subtotal, discountPercent]);

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableAmount * Number(taxPercent)) / 100;
  const finalTotal = taxableAmount + taxAmount;

  // Handle Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const salePayload = {
        invoiceNumber,
        customerName: customerName.trim() || 'Walk-in Customer',
        customerPhone: customerPhone.trim() || '-',
        items: cart.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.sellingPrice,
          total: item.quantity * item.sellingPrice
        })),
        subtotal,
        discountPercent: Number(discountPercent),
        discountAmount,
        taxRate: Number(taxPercent),
        taxAmount,
        total: finalTotal,
        paymentMethod
      };

      const result = await completeSale(salePayload);
      setLastInvoice(result);
      setIsReceiptOpen(true);
      // Reset inputs
      setCustomerName('Walk-in Customer');
      setCustomerPhone('');
      setDiscountPercent(0);
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Point of Sale (POS)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rapid retail billing register with real-time stock deduction and tax invoice generation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Terminal:</span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs">
            {settings.store.storeCode} - Register #1
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Selection Catalog (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Category Pills */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-soft space-y-3">
            <div className="relative">
              <ScanBarcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Scan barcode or type item name, SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                All Items
              </button>
              {INITIAL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {availableProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-xs text-slate-400">
                No matching products found.
              </div>
            ) : (
              availableProducts.map((p) => {
                const inCart = cart.find(c => c.productId === p.id);
                const cartQty = inCart ? inCart.quantity : 0;
                const isOutOfStock = p.currentStock <= 0;
                const isMaxReached = cartQty >= p.currentStock;

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (!isOutOfStock && !isMaxReached) addToCart(p);
                    }}
                    className={`bg-white dark:bg-slate-900 border rounded-2xl p-3 shadow-soft flex flex-col justify-between transition-all select-none ${
                      isOutOfStock
                        ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800'
                        : isMaxReached
                        ? 'border-amber-300 dark:border-amber-800 cursor-not-allowed'
                        : 'hover:border-blue-500 cursor-pointer hover:shadow-md border-slate-200 dark:border-slate-800 active:scale-98'
                    }`}
                  >
                    <div>
                      <div className="relative h-24 rounded-xl overflow-hidden mb-2 bg-slate-100 dark:bg-slate-800">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        <span
                          className={`absolute top-1.5 right-1.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md text-white ${
                            p.currentStock === 0
                              ? 'bg-rose-600'
                              : p.currentStock <= p.minStockLevel
                              ? 'bg-amber-600'
                              : 'bg-slate-900/80 backdrop-blur-sm'
                          }`}
                        >
                          {p.currentStock} in stock
                        </span>
                        {cartQty > 0 && (
                          <span className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                            {cartQty} in cart
                          </span>
                        )}
                      </div>

                      <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight block truncate">
                        {p.category}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs line-clamp-2 mt-0.5 leading-snug">
                        {p.name}
                      </h4>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(p.sellingPrice, settings.store.currency)}
                      </span>
                      <button
                        type="button"
                        disabled={isOutOfStock || isMaxReached}
                        className={`p-1.5 rounded-lg text-white font-bold transition-colors ${
                          isOutOfStock || isMaxReached
                            ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Billing Cart & Checkout Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-soft p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Current Cart</h3>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Customer Details Inputs */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Walk-in Customer"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91..."
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <ShoppingCart className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                Cart is currently empty. Click on products to add items.
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-slate-900 dark:text-white truncate">{item.name}</h5>
                    <span className="text-[10px] text-slate-400">
                      {formatCurrency(item.sellingPrice, settings.store.currency)} each
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateCartQty(item.productId, item.quantity - 1)}
                      className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQty(item.productId, item.quantity + 1)}
                      className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right w-16">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {formatCurrency(item.sellingPrice * item.quantity, settings.store.currency)}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Pricing Calculations & Discounts */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} items)</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatCurrency(subtotal, settings.store.currency)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-500">
              <div className="flex items-center gap-1.5">
                <span>Discount (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-12 px-1.5 py-0.5 text-center bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
                />
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                - {formatCurrency(discountAmount, settings.store.currency)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-500">
              <div className="flex items-center gap-1.5">
                <span>GST Tax (%)</span>
                <select
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                  className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
                >
                  <option value={0}>0%</option>
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18%</option>
                  <option value={28}>28%</option>
                </select>
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">
                + {formatCurrency(taxAmount, settings.store.currency)}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm font-extrabold text-slate-900 dark:text-white">
              <span>Final Total</span>
              <span className="text-lg text-blue-600 dark:text-blue-400">
                {formatCurrency(finalTotal, settings.store.currency)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'UPI (Google Pay / PhonePe)', label: 'UPI / QR', icon: Smartphone },
                { id: 'Cash', label: 'Cash', icon: Banknote },
                { id: 'Credit/Debit Card', label: 'Card', icon: CreditCard }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                    paymentMethod === m.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <m.icon className="w-4 h-4 mb-1" />
                  <span className="text-[10px]">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Complete Sale Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            <Receipt className="w-4 h-4" />
            {isProcessing ? 'Processing Transaction...' : `Complete Sale • ${formatCurrency(finalTotal, settings.store.currency)}`}
          </button>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {lastInvoice && (
        <Modal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          title="Tax Invoice Generated"
          subtitle={`Invoice #${lastInvoice.invoiceNumber} recorded successfully`}
          maxWidth="max-w-md"
        >
          <div id="printable-receipt" className="space-y-4 text-xs font-mono text-slate-800">
            {/* Receipt Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h2 className="text-base font-extrabold uppercase tracking-wider">{settings.store.name}</h2>
              <p className="text-[11px] text-slate-600">{settings.store.address}</p>
              <p className="text-[11px] text-slate-600">GSTIN: {settings.store.gstNumber} | Phone: {settings.store.phone}</p>
              <div className="mt-2 text-[10px] text-slate-500">
                <span>Invoice: {lastInvoice.invoiceNumber}</span> • <span>Date: {lastInvoice.date}</span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="text-[11px] pb-2 border-b border-dashed border-slate-300">
              <p>Customer: <strong>{lastInvoice.customerName}</strong></p>
              <p>Contact: {lastInvoice.customerPhone}</p>
              <p>Cashier: {lastInvoice.cashier}</p>
              <p>Payment: {lastInvoice.paymentMethod}</p>
            </div>

            {/* Line Items */}
            <div className="py-2 border-b border-dashed border-slate-300 space-y-1.5">
              <div className="flex justify-between font-bold text-[11px]">
                <span>Item</span>
                <span>Qty x Price</span>
                <span>Total</span>
              </div>
              {lastInvoice.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span className="truncate max-w-[150px]">{item.name}</span>
                  <span>{item.quantity} x {item.price}</span>
                  <span>{formatCurrency(item.total, settings.store.currency)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="py-2 border-b border-dashed border-slate-300 space-y-1 text-right text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(lastInvoice.subtotal, settings.store.currency)}</span>
              </div>
              {lastInvoice.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount:</span>
                  <span>- {formatCurrency(lastInvoice.discountAmount, settings.store.currency)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax GST ({lastInvoice.taxRate}%):</span>
                <span>+ {formatCurrency(lastInvoice.taxAmount, settings.store.currency)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-400">
                <span>Grand Total:</span>
                <span>{formatCurrency(lastInvoice.total, settings.store.currency)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] text-slate-500 pt-2 space-y-1">
              <p>{settings.store.receiptHeader}</p>
              <p>{settings.store.receiptFooter}</p>
              <p className="font-bold">*** Stockify AI Automated POS ***</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsReceiptOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Receipt
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
