import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { initializeStorage, storageService } from '../services/storage';
import {
  productService,
  supplierService,
  inventoryService,
  salesService,
  purchaseOrderService,
  alertService,
  wastageService,
  settingsService
} from '../services/api';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // 1. Initialize Storage once
  useEffect(() => {
    initializeStorage();
  }, []);

  // 2. Theme Management (Light / Dark)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('stockify_theme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('stockify_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // 3. User Role Simulation (Admin, Manager, Staff)
  const [currentRole, setCurrentRole] = useState(() => storageService.getCurrentRole());

  const switchRole = (role) => {
    setCurrentRole(role);
    storageService.setCurrentRole(role);
    addToast(`Switched active workspace view to: ${role} Role`, 'info');
  };

  // 4. Global Search
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // 5. Toast System
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 6. Data Entities
  const [products, setProducts] = useState(() => storageService.getProducts());
  const [suppliers, setSuppliers] = useState(() => storageService.getSuppliers());
  const [transactions, setTransactions] = useState(() => storageService.getTransactions());
  const [sales, setSales] = useState(() => storageService.getSales());
  const [purchaseOrders, setPurchaseOrders] = useState(() => storageService.getPurchaseOrders());
  const [alerts, setAlerts] = useState(() => storageService.getAlerts());
  const [wastageRecords, setWastageRecords] = useState(() => storageService.getWastage());
  const [settings, setSettings] = useState(() => storageService.getSettings());

  // 7. POS Cart State
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    const currentInCart = cart.find(item => item.productId === product.id);
    const existingQty = currentInCart ? currentInCart.quantity : 0;
    
    if (existingQty + 1 > product.currentStock) {
      addToast(`Cannot add more. Only ${product.currentStock} units in stock!`, 'warning');
      return false;
    }

    if (currentInCart) {
      setCart(prev =>
        prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.sellingPrice }
            : item
        )
      );
    } else {
      setCart(prev => [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          sellingPrice: product.sellingPrice,
          purchasePrice: product.purchasePrice,
          quantity: 1,
          total: product.sellingPrice,
          availableStock: product.currentStock,
          image: product.image
        }
      ]);
    }
    addToast(`Added "${product.name.slice(0, 22)}..." to cart`, 'success');
    return true;
  };

  const updateCartQty = (productId, newQty) => {
    const p = products.find(prod => prod.id === productId);
    const maxStock = p ? p.currentStock : 999;

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQty > maxStock) {
      addToast(`Only ${maxStock} units available in stock.`, 'warning');
      newQty = maxStock;
    }

    setCart(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQty, total: newQty * item.sellingPrice }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => setCart([]);

  // 8. CRUD Actions & Stock Updates

  // Product Actions
  const addProduct = async (productData) => {
    try {
      const res = await productService.create(productData);
      setProducts(prev => [res.data, ...prev]);
      addToast(`Product "${res.data.name}" created successfully.`, 'success');
      return res.data;
    } catch (err) {
      addToast(err.message || 'Failed to create product', 'error');
      throw err;
    }
  };

  const updateProduct = async (id, updates) => {
    try {
      const res = await productService.update(id, updates);
      setProducts(prev => prev.map(p => (p.id === id ? res.data : p)));
      addToast(`Product "${res.data.name}" updated successfully.`, 'success');
      return res.data;
    } catch (err) {
      addToast(err.message || 'Failed to update product', 'error');
      throw err;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await productService.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      addToast('Product removed successfully.', 'info');
    } catch (err) {
      addToast(err.message || 'Failed to delete product', 'error');
      throw err;
    }
  };

  // Supplier Actions
  const addSupplier = async (supplierData) => {
    try {
      const res = await supplierService.create(supplierData);
      setSuppliers(prev => [...prev, res.data]);
      addToast(`Supplier "${res.data.name}" added.`, 'success');
      return res.data;
    } catch (err) {
      addToast(err.message || 'Failed to add supplier', 'error');
      throw err;
    }
  };

  const updateSupplier = async (id, updates) => {
    try {
      const res = await supplierService.update(id, updates);
      setSuppliers(prev => prev.map(s => (s.id === id ? res.data : s)));
      addToast(`Supplier "${res.data.name}" updated.`, 'success');
      return res.data;
    } catch (err) {
      addToast(err.message || 'Failed to update supplier', 'error');
      throw err;
    }
  };

  const deleteSupplier = async (id) => {
    try {
      await supplierService.delete(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
      addToast('Supplier deleted.', 'info');
    } catch (err) {
      addToast(err.message || 'Failed to delete supplier', 'error');
      throw err;
    }
  };

  // Inventory Stock Mutations
  const performStockIn = async ({ productId, quantity, reason }) => {
    try {
      const res = await inventoryService.stockIn({
        productId,
        quantity,
        reason,
        performedBy: `${currentRole} (${settings.currentUser.name})`
      });
      // Refresh products and transactions
      setProducts(storageService.getProducts());
      setTransactions(storageService.getTransactions());
      addToast(`Stock In: +${quantity} units recorded for ${res.data.product.name}.`, 'success');
      return res.data;
    } catch (err) {
      addToast(err.message || 'Failed to record Stock In', 'error');
      throw err;
    }
  };

  const performStockOut = async ({ productId, quantity, reason }) => {
    try {
      const res = await inventoryService.stockOut({
        productId,
        quantity,
        reason,
        performedBy: `${currentRole} (${settings.currentUser.name})`
      });
      setProducts(storageService.getProducts());
      setTransactions(storageService.getTransactions());
      addToast(`Stock Out: -${quantity} units recorded for ${res.data.product.name}.`, 'info');
      return res.data;
    } catch (err) {
      addToast(err.message || 'Failed to record Stock Out', 'error');
      throw err;
    }
  };

  const performStockAdjustment = async ({ productId, updatedQuantity, reason }) => {
    try {
      const res = await inventoryService.stockAdjustment({
        productId,
        updatedQuantity,
        reason,
        performedBy: `${currentRole} (${settings.currentUser.name})`
      });
      setProducts(storageService.getProducts());
      setTransactions(storageService.getTransactions());
      addToast(`Stock adjusted for ${res.data.product.name} to ${updatedQuantity} units.`, 'success');
      return res.data;
    } catch (err) {
      addToast(err.message || 'Failed to adjust stock', 'error');
      throw err;
    }
  };

  // POS Sale Completion
  const completeSale = async (salePayload) => {
    try {
      const res = await salesService.createSale({
        ...salePayload,
        cashier: `${settings.currentUser.name} (${currentRole})`
      });
      setSales(storageService.getSales());
      setProducts(storageService.getProducts());
      setTransactions(storageService.getTransactions());
      clearCart();
      addToast(`Sale #${res.data.invoiceNumber} completed successfully!`, 'success');
      return res.data;
    } catch (err) {
      addToast(err.message || 'Failed to complete sale', 'error');
      throw err;
    }
  };

  // Purchase Order Operations
  const createPurchaseOrder = async (poData) => {
    try {
      const res = await purchaseOrderService.create(poData);
      setPurchaseOrders(storageService.getPurchaseOrders());
      addToast(`Purchase Order ${res.data.poNumber} created.`, 'success');
      return res.data;
    } catch (err) {
      addToast(err.message || 'Failed to create PO', 'error');
      throw err;
    }
  };

  const updatePOStatus = async (id, status) => {
    try {
      const res = await purchaseOrderService.updateStatus(id, status);
      setPurchaseOrders(storageService.getPurchaseOrders());
      addToast(`PO ${res.data.poNumber} marked as ${status}.`, 'info');
      return res.data;
    } catch (err) {
      addToast(err.message || 'Failed to update PO status', 'error');
      throw err;
    }
  };

  const receivePOItems = async (poId, receivedQuantities) => {
    try {
      const res = await purchaseOrderService.receiveItems(poId, receivedQuantities);
      setPurchaseOrders(storageService.getPurchaseOrders());
      setProducts(storageService.getProducts());
      setTransactions(storageService.getTransactions());
      addToast(`Stock received and added to inventory from PO ${res.data.poNumber}.`, 'success');
      return res.data;
    } catch (err) {
      addToast(err.message || 'Failed to receive PO stock', 'error');
      throw err;
    }
  };

  // Alert Resolution
  const resolveAlert = async (id) => {
    try {
      await alertService.resolve(id);
      setAlerts(storageService.getAlerts());
      addToast('Alert marked as resolved.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to resolve alert', 'error');
    }
  };

  // Expiry Wastage Action
  const recordWastage = async (wastageData) => {
    try {
      const res = await wastageService.record(wastageData);
      setWastageRecords(storageService.getWastage());
      setProducts(storageService.getProducts());
      setTransactions(storageService.getTransactions());
      addToast(`Wastage record saved. Stock updated.`, 'info');
      return res.data;
    } catch (err) {
      addToast(err.message || 'Failed to record wastage', 'error');
      throw err;
    }
  };

  // Settings
  const updateSettings = async (newSettings) => {
    try {
      await settingsService.updateSettings(newSettings);
      setSettings(newSettings);
      addToast('Settings updated successfully.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update settings', 'error');
    }
  };

  // Reset Mock Data
  const resetToFactoryMock = () => {
    storageService.resetAll();
    setProducts(storageService.getProducts());
    setSuppliers(storageService.getSuppliers());
    setTransactions(storageService.getTransactions());
    setSales(storageService.getSales());
    setPurchaseOrders(storageService.getPurchaseOrders());
    setAlerts(storageService.getAlerts());
    setWastageRecords(storageService.getWastage());
    setSettings(storageService.getSettings());
    setCurrentRole('Admin');
    clearCart();
    addToast('System reset to original demo mock data!', 'info');
  };

  // 9. Computed Analytics & KPI Statistics
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalInventoryQty = products.reduce((acc, p) => acc + Number(p.currentStock || 0), 0);
    const inventoryValuation = products.reduce((acc, p) => acc + (Number(p.purchasePrice || 0) * Number(p.currentStock || 0)), 0);
    const potentialRevenue = products.reduce((acc, p) => acc + (Number(p.sellingPrice || 0) * Number(p.currentStock || 0)), 0);
    
    // Low / Out of stock counts
    const lowStockCount = products.filter(p => Number(p.currentStock) > 0 && Number(p.currentStock) <= Number(p.minStockLevel)).length;
    const outOfStockCount = products.filter(p => Number(p.currentStock) === 0).length;

    // Sales metrics
    const today = new Date().toISOString().split('T')[0];
    const todaySalesList = sales.filter(s => s.date && s.date.startsWith(today));
    const todaySalesRevenue = todaySalesList.reduce((acc, s) => acc + Number(s.total || 0), 0);
    const totalSalesRevenue = sales.reduce((acc, s) => acc + Number(s.total || 0), 0);

    // Purchase order metrics
    const pendingPOs = purchaseOrders.filter(po => po.status === 'Pending' || po.status === 'Approved').length;

    return {
      totalProducts,
      totalInventoryQty,
      inventoryValuation,
      potentialRevenue,
      todaySalesRevenue,
      totalSalesRevenue,
      todaySalesCount: todaySalesList.length,
      lowStockCount,
      outOfStockCount,
      pendingPOs
    };
  }, [products, sales, purchaseOrders]);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        currentRole,
        switchRole,
        globalSearchQuery,
        setGlobalSearchQuery,
        toasts,
        addToast,
        removeToast,
        // Entities & Actions
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        transactions,
        performStockIn,
        performStockOut,
        performStockAdjustment,
        sales,
        completeSale,
        purchaseOrders,
        createPurchaseOrder,
        updatePOStatus,
        receivePOItems,
        alerts,
        resolveAlert,
        wastageRecords,
        recordWastage,
        settings,
        updateSettings,
        resetToFactoryMock,
        // POS Cart
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        // Stats
        stats
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
