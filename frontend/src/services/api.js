import axios from 'axios';
import { storageService } from './storage';
import { FORECASTING_DATA, ANOMALY_RECORDS } from '../data/mockData';

// Axios instance configured for future FastAPI / MongoDB backend
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Mock async latency helper for realistic SaaS feel
const asyncWrap = (data, delay = 50) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data, status: 200 }), delay);
  });
};

export const productService = {
  getAll: async () => asyncWrap(storageService.getProducts()),
  getById: async (id) => {
    const products = storageService.getProducts();
    const item = products.find(p => p.id === id);
    return asyncWrap(item || null);
  },
  create: async (productData) => {
    const products = storageService.getProducts();
    const newProduct = {
      ...productData,
      id: `PRD-${Date.now().toString().slice(-4)}`,
      status: Number(productData.currentStock) === 0 
        ? 'Out of Stock' 
        : Number(productData.currentStock) <= Number(productData.minStockLevel) 
          ? 'Low Stock' 
          : 'In Stock'
    };
    const updated = [newProduct, ...products];
    storageService.saveProducts(updated);
    return asyncWrap(newProduct);
  },
  update: async (id, updates) => {
    const products = storageService.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    
    const updatedProduct = {
      ...products[index],
      ...updates,
      status: Number(updates.currentStock ?? products[index].currentStock) === 0
        ? 'Out of Stock'
        : Number(updates.currentStock ?? products[index].currentStock) <= Number(updates.minStockLevel ?? products[index].minStockLevel)
          ? 'Low Stock'
          : 'In Stock'
    };
    products[index] = updatedProduct;
    storageService.saveProducts(products);
    return asyncWrap(updatedProduct);
  },
  delete: async (id) => {
    const products = storageService.getProducts();
    const filtered = products.filter(p => p.id !== id);
    storageService.saveProducts(filtered);
    return asyncWrap({ success: true, id });
  }
};

export const supplierService = {
  getAll: async () => asyncWrap(storageService.getSuppliers()),
  create: async (supplierData) => {
    const suppliers = storageService.getSuppliers();
    const newSupplier = {
      ...supplierData,
      id: `SUP-${String(suppliers.length + 1).padStart(3, '0')}`,
      status: 'Active',
      rating: 4.8
    };
    const updated = [...suppliers, newSupplier];
    storageService.saveSuppliers(updated);
    return asyncWrap(newSupplier);
  },
  update: async (id, updates) => {
    const suppliers = storageService.getSuppliers();
    const index = suppliers.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Supplier not found');
    suppliers[index] = { ...suppliers[index], ...updates };
    storageService.saveSuppliers(suppliers);
    return asyncWrap(suppliers[index]);
  },
  delete: async (id) => {
    const suppliers = storageService.getSuppliers();
    const filtered = suppliers.filter(s => s.id !== id);
    storageService.saveSuppliers(filtered);
    return asyncWrap({ success: true, id });
  }
};

export const inventoryService = {
  getTransactions: async () => asyncWrap(storageService.getTransactions()),
  
  // Stock In: increases stock & logs transaction
  stockIn: async ({ productId, quantity, reason, performedBy }) => {
    const products = storageService.getProducts();
    const p = products.find(item => item.id === productId);
    if (!p) throw new Error('Product not found');

    const previousStock = Number(p.currentStock);
    const addedQty = Number(quantity);
    const updatedStock = previousStock + addedQty;

    // Update Product Stock
    p.currentStock = updatedStock;
    p.status = updatedStock <= Number(p.minStockLevel) ? 'Low Stock' : 'In Stock';
    storageService.saveProducts(products);

    // Log Transaction
    const newTx = {
      id: `TX-${Date.now().toString().slice(-4)}`,
      productId,
      productName: p.name,
      sku: p.sku,
      type: 'Stock In',
      quantity: addedQty,
      previousStock,
      updatedStock,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      reason: reason || 'Manual Stock In Replenishment',
      performedBy: performedBy || 'Store Staff'
    };
    storageService.addTransaction(newTx);
    return asyncWrap({ product: p, transaction: newTx });
  },

  // Stock Out: decreases stock & logs transaction
  stockOut: async ({ productId, quantity, reason, performedBy }) => {
    const products = storageService.getProducts();
    const p = products.find(item => item.id === productId);
    if (!p) throw new Error('Product not found');

    const previousStock = Number(p.currentStock);
    const removedQty = Number(quantity);
    if (removedQty > previousStock) {
      throw new Error(`Cannot remove ${removedQty} units. Only ${previousStock} units available.`);
    }

    const updatedStock = previousStock - removedQty;
    p.currentStock = updatedStock;
    p.status = updatedStock === 0 ? 'Out of Stock' : updatedStock <= Number(p.minStockLevel) ? 'Low Stock' : 'In Stock';
    storageService.saveProducts(products);

    const newTx = {
      id: `TX-${Date.now().toString().slice(-4)}`,
      productId,
      productName: p.name,
      sku: p.sku,
      type: 'Stock Out',
      quantity: removedQty,
      previousStock,
      updatedStock,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      reason: reason || 'Manual Stock Out Delivery / Usage',
      performedBy: performedBy || 'Store Staff'
    };
    storageService.addTransaction(newTx);
    return asyncWrap({ product: p, transaction: newTx });
  },

  // Stock Adjustment: sets explicit quantity with discrepancy reason
  stockAdjustment: async ({ productId, updatedQuantity, reason, performedBy }) => {
    const products = storageService.getProducts();
    const p = products.find(item => item.id === productId);
    if (!p) throw new Error('Product not found');

    const previousStock = Number(p.currentStock);
    const newQty = Math.max(0, Number(updatedQuantity));
    const diff = newQty - previousStock;

    p.currentStock = newQty;
    p.status = newQty === 0 ? 'Out of Stock' : newQty <= Number(p.minStockLevel) ? 'Low Stock' : 'In Stock';
    storageService.saveProducts(products);

    const newTx = {
      id: `TX-${Date.now().toString().slice(-4)}`,
      productId,
      productName: p.name,
      sku: p.sku,
      type: 'Stock Adjustment',
      quantity: diff,
      previousStock,
      updatedStock: newQty,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      reason: reason || 'Inventory Physical Audit Correction',
      performedBy: performedBy || 'Inventory Admin'
    };
    storageService.addTransaction(newTx);
    return asyncWrap({ product: p, transaction: newTx });
  }
};

export const salesService = {
  getAll: async () => asyncWrap(storageService.getSales()),
  createSale: async (saleData) => {
    // 1. Deduct stock from products & log transactions
    const products = storageService.getProducts();

    saleData.items.forEach(item => {
      const p = products.find(prod => prod.id === item.productId);
      if (p) {
        const prev = Number(p.currentStock);
        const updated = Math.max(0, prev - Number(item.quantity));
        p.currentStock = updated;
        p.status = updated === 0 ? 'Out of Stock' : updated <= Number(p.minStockLevel) ? 'Low Stock' : 'In Stock';

        // Log transaction
        storageService.addTransaction({
          id: `TX-${Date.now().toString().slice(-4)}-${Math.floor(Math.random()*100)}`,
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          type: 'Stock Out',
          quantity: item.quantity,
          previousStock: prev,
          updatedStock: updated,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          reason: `POS Sale - ${saleData.invoiceNumber}`,
          performedBy: saleData.cashier || 'Cashier'
        });
      }
    });

    storageService.saveProducts(products);

    // 2. Save sale record
    const newSale = {
      ...saleData,
      id: saleData.invoiceNumber,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Completed'
    };
    storageService.addSale(newSale);

    return asyncWrap(newSale);
  }
};

export const purchaseOrderService = {
  getAll: async () => asyncWrap(storageService.getPurchaseOrders()),
  create: async (poData) => {
    const pos = storageService.getPurchaseOrders();
    const newPO = {
      ...poData,
      id: `PO-${Date.now().toString().slice(-4)}`,
      poNumber: `PO-2026-${String(pos.length + 1).padStart(3, '0')}`,
      status: 'Pending',
      orderDate: new Date().toISOString().split('T')[0],
      deliveredDate: null
    };
    const updated = [newPO, ...pos];
    storageService.savePurchaseOrders(updated);
    return asyncWrap(newPO);
  },
  updateStatus: async (id, status) => {
    const pos = storageService.getPurchaseOrders();
    const po = pos.find(p => p.id === id);
    if (!po) throw new Error('Purchase Order not found');
    po.status = status;
    if (status === 'Completed') {
      po.deliveredDate = new Date().toISOString().split('T')[0];
    }
    storageService.savePurchaseOrders(pos);
    return asyncWrap(po);
  },
  // Receive stock from PO (Full or Partial)
  receiveItems: async (id, receivedItemQuantities) => {
    const pos = storageService.getPurchaseOrders();
    const po = pos.find(p => p.id === id);
    if (!po) throw new Error('Purchase Order not found');

    const products = storageService.getProducts();
    let allFullyReceived = true;

    po.items.forEach(item => {
      const qtyToReceive = Number(receivedItemQuantities[item.productId] || 0);
      if (qtyToReceive > 0) {
        item.receivedQuantity = (Number(item.receivedQuantity) || 0) + qtyToReceive;

        // Increase inventory stock
        const p = products.find(prod => prod.id === item.productId);
        if (p) {
          const prev = Number(p.currentStock);
          const updated = prev + qtyToReceive;
          p.currentStock = updated;
          p.status = updated <= Number(p.minStockLevel) ? 'Low Stock' : 'In Stock';

          // Log transaction
          storageService.addTransaction({
            id: `TX-${Date.now().toString().slice(-4)}-${Math.floor(Math.random()*100)}`,
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            type: 'Stock In',
            quantity: qtyToReceive,
            previousStock: prev,
            updatedStock: updated,
            date: new Date().toISOString().replace('T', ' ').slice(0, 16),
            reason: `PO Goods Received - ${po.poNumber}`,
            performedBy: 'Receiving Staff'
          });
        }
      }

      if (Number(item.receivedQuantity || 0) < Number(item.quantity)) {
        allFullyReceived = false;
      }
    });

    storageService.saveProducts(products);

    po.status = allFullyReceived ? 'Completed' : 'Partially Received';
    if (allFullyReceived) {
      po.deliveredDate = new Date().toISOString().split('T')[0];
    }
    storageService.savePurchaseOrders(pos);

    return asyncWrap(po);
  }
};

export const alertService = {
  getAll: async () => asyncWrap(storageService.getAlerts()),
  resolve: async (id) => {
    const alerts = storageService.getAlerts();
    const alert = alerts.find(a => a.id === id);
    if (alert) {
      alert.status = 'resolved';
      storageService.saveAlerts(alerts);
    }
    return asyncWrap(alert);
  }
};

export const wastageService = {
  getAll: async () => asyncWrap(storageService.getWastage()),
  record: async (recordData) => {
    // Deduct stock of expired product
    const products = storageService.getProducts();
    const p = products.find(prod => prod.id === recordData.productId);
    if (p) {
      const prev = Number(p.currentStock);
      const lostQty = Number(recordData.quantity);
      p.currentStock = Math.max(0, prev - lostQty);
      p.status = p.currentStock === 0 ? 'Out of Stock' : p.currentStock <= Number(p.minStockLevel) ? 'Low Stock' : 'In Stock';
      storageService.saveProducts(products);

      // Log transaction
      storageService.addTransaction({
        id: `TX-${Date.now().toString().slice(-4)}`,
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        type: 'Stock Out',
        quantity: lostQty,
        previousStock: prev,
        updatedStock: p.currentStock,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        reason: `Wastage Write-Off: ${recordData.reason}`,
        performedBy: recordData.authorizedBy || 'Store Manager'
      });
    }

    const newRecord = {
      ...recordData,
      id: `WST-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0]
    };
    storageService.addWastageRecord(newRecord);
    return asyncWrap(newRecord);
  }
};

export const forecastingService = {
  getForecastData: async () => asyncWrap(FORECASTING_DATA)
};

export const analyticsService = {
  getAnomalies: async () => asyncWrap(ANOMALY_RECORDS)
};

export const settingsService = {
  getSettings: async () => asyncWrap(storageService.getSettings()),
  updateSettings: async (settings) => {
    storageService.saveSettings(settings);
    return asyncWrap(settings);
  }
};
