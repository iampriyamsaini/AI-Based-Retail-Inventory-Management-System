import {
  INITIAL_PRODUCTS,
  INITIAL_SUPPLIERS,
  INITIAL_TRANSACTIONS,
  INITIAL_SALES,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_ALERTS,
  INITIAL_WASTAGE_RECORDS,
  INITIAL_SETTINGS
} from '../data/mockData';

const STORAGE_KEYS = {
  PRODUCTS: 'stockify_products_v1',
  SUPPLIERS: 'stockify_suppliers_v1',
  TRANSACTIONS: 'stockify_transactions_v1',
  SALES: 'stockify_sales_v1',
  PURCHASE_ORDERS: 'stockify_purchase_orders_v1',
  ALERTS: 'stockify_alerts_v1',
  WASTAGE: 'stockify_wastage_v1',
  SETTINGS: 'stockify_settings_v1',
  CURRENT_USER_ROLE: 'stockify_current_role_v1'
};

// Safe JSON retrieval with fallback
const getStorageItem = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
};

const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
};

// Seed initial data if not already present
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    setStorageItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
    setStorageItem(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    setStorageItem(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
    setStorageItem(STORAGE_KEYS.SALES, INITIAL_SALES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PURCHASE_ORDERS)) {
    setStorageItem(STORAGE_KEYS.PURCHASE_ORDERS, INITIAL_PURCHASE_ORDERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ALERTS)) {
    setStorageItem(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.WASTAGE)) {
    setStorageItem(STORAGE_KEYS.WASTAGE, INITIAL_WASTAGE_RECORDS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    setStorageItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }
};

export const storageService = {
  // Products
  getProducts: () => getStorageItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS),
  saveProducts: (products) => setStorageItem(STORAGE_KEYS.PRODUCTS, products),

  // Suppliers
  getSuppliers: () => getStorageItem(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS),
  saveSuppliers: (suppliers) => setStorageItem(STORAGE_KEYS.SUPPLIERS, suppliers),

  // Inventory Transactions
  getTransactions: () => getStorageItem(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS),
  saveTransactions: (txs) => setStorageItem(STORAGE_KEYS.TRANSACTIONS, txs),
  addTransaction: (tx) => {
    const list = getStorageItem(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    const updated = [tx, ...list];
    setStorageItem(STORAGE_KEYS.TRANSACTIONS, updated);
    return updated;
  },

  // Sales
  getSales: () => getStorageItem(STORAGE_KEYS.SALES, INITIAL_SALES),
  saveSales: (sales) => setStorageItem(STORAGE_KEYS.SALES, sales),
  addSale: (sale) => {
    const list = getStorageItem(STORAGE_KEYS.SALES, INITIAL_SALES);
    const updated = [sale, ...list];
    setStorageItem(STORAGE_KEYS.SALES, updated);
    return updated;
  },

  // Purchase Orders
  getPurchaseOrders: () => getStorageItem(STORAGE_KEYS.PURCHASE_ORDERS, INITIAL_PURCHASE_ORDERS),
  savePurchaseOrders: (pos) => setStorageItem(STORAGE_KEYS.PURCHASE_ORDERS, pos),

  // Alerts
  getAlerts: () => getStorageItem(STORAGE_KEYS.ALERTS, INITIAL_ALERTS),
  saveAlerts: (alerts) => setStorageItem(STORAGE_KEYS.ALERTS, alerts),

  // Wastage Records
  getWastage: () => getStorageItem(STORAGE_KEYS.WASTAGE, INITIAL_WASTAGE_RECORDS),
  saveWastage: (wastage) => setStorageItem(STORAGE_KEYS.WASTAGE, wastage),
  addWastageRecord: (record) => {
    const list = getStorageItem(STORAGE_KEYS.WASTAGE, INITIAL_WASTAGE_RECORDS);
    const updated = [record, ...list];
    setStorageItem(STORAGE_KEYS.WASTAGE, updated);
    return updated;
  },

  // Settings
  getSettings: () => getStorageItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS),
  saveSettings: (settings) => setStorageItem(STORAGE_KEYS.SETTINGS, settings),

  // Active Role Switcher
  getCurrentRole: () => localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ROLE) || 'Admin',
  setCurrentRole: (role) => localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ROLE, role),

  // Reset to initial mock data
  resetAll: () => {
    setStorageItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    setStorageItem(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    setStorageItem(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    setStorageItem(STORAGE_KEYS.SALES, INITIAL_SALES);
    setStorageItem(STORAGE_KEYS.PURCHASE_ORDERS, INITIAL_PURCHASE_ORDERS);
    setStorageItem(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
    setStorageItem(STORAGE_KEYS.WASTAGE, INITIAL_WASTAGE_RECORDS);
    setStorageItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ROLE, 'Admin');
  }
};
