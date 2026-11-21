// Initial Mock Data for Stockify AI Retail Management System

export const INITIAL_CATEGORIES = [
  "Dairy & Beverages",
  "Groceries & Staples",
  "Snacks & Packaged Food",
  "Health & Personal Care",
  "Home Essentials",
  "Electronics & Gadgets"
];

export const INITIAL_SUPPLIERS = [
  {
    id: "SUP-001",
    name: "Amul Dairy Distributors Ltd.",
    contactPerson: "Rajesh Sharma",
    phone: "+91 98201 44521",
    email: "rajesh.amul@dairypartners.com",
    address: "Plot 42, Anand Industrial Area, Gujarat - 388001",
    leadTime: 2, // days
    rating: 4.8,
    status: "Active",
    suppliedCategories: ["Dairy & Beverages"]
  },
  {
    id: "SUP-002",
    name: "Tata Consumer Products Supply",
    contactPerson: "Sunita Deshmukh",
    phone: "+91 98450 11234",
    email: "sunita.d@tataconsumer.com",
    address: "Kirloskar Tech Park, Hebbal, Bengaluru - 560024",
    leadTime: 3,
    rating: 4.9,
    status: "Active",
    suppliedCategories: ["Groceries & Staples", "Snacks & Packaged Food"]
  },
  {
    id: "SUP-003",
    name: "Hindustan FMCG Logistics",
    contactPerson: "Vikram Singhania",
    phone: "+91 97112 88990",
    email: "orders@hfmcg-logistics.in",
    address: "Andheri East Logistics Hub, Mumbai - 400069",
    leadTime: 4,
    rating: 4.6,
    status: "Active",
    suppliedCategories: ["Health & Personal Care", "Home Essentials"]
  },
  {
    id: "SUP-004",
    name: "Haldiram Snack Ventures",
    contactPerson: "Amit Agrawal",
    phone: "+91 98765 43210",
    email: "b2b@haldiramventures.com",
    address: "Nagpur Food Industrial Park, Maharashtra - 440023",
    leadTime: 2,
    rating: 4.7,
    status: "Active",
    suppliedCategories: ["Snacks & Packaged Food"]
  },
  {
    id: "SUP-005",
    name: "NexTech Electronics Importers",
    contactPerson: "Priya Nair",
    phone: "+91 99001 77223",
    email: "procurement@nextechelec.com",
    address: "Sector 62, Electronic City, Noida - 201301",
    leadTime: 6,
    rating: 4.5,
    status: "Active",
    suppliedCategories: ["Electronics & Gadgets"]
  }
];

// Helper to generate dates relative to current date for realistic expiry & trends
const now = new Date();
const formatDate = (daysOffset) => {
  const d = new Date(now);
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

export const INITIAL_PRODUCTS = [
  {
    id: "PRD-101",
    name: "Amul Taaza Homogenised Toned Milk 1L",
    sku: "MILK-AMUL-01",
    barcode: "8901262010051",
    category: "Dairy & Beverages",
    description: "Ultra-high temperature treated toned milk with 3.0% fat, 8.5% SNF.",
    purchasePrice: 62.00,
    sellingPrice: 72.00,
    currentStock: 18,
    minStockLevel: 25, // Low Stock!
    supplierId: "SUP-001",
    supplierName: "Amul Dairy Distributors Ltd.",
    expiryDate: formatDate(12), // Near expiry
    status: "Low Stock",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=60"
  },
  {
    id: "PRD-102",
    name: "Tata Salt Vacuum Evaporated 1kg",
    sku: "SALT-TATA-01",
    barcode: "8901030383451",
    category: "Groceries & Staples",
    description: "Iodised salt with guarantee of vacuum evaporation purity.",
    purchasePrice: 22.00,
    sellingPrice: 28.00,
    currentStock: 85,
    minStockLevel: 20,
    supplierId: "SUP-002",
    supplierName: "Tata Consumer Products Supply",
    expiryDate: formatDate(365),
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&auto=format&fit=crop&q=60"
  },
  {
    id: "PRD-103",
    name: "Fortune Sunlite Refined Sunflower Oil 1L",
    sku: "OIL-FORT-01",
    barcode: "8906007280018",
    category: "Groceries & Staples",
    description: "Refined sunflower oil enriched with Vitamins A & D.",
    purchasePrice: 125.00,
    sellingPrice: 148.00,
    currentStock: 6,
    minStockLevel: 15, // Low Stock!
    supplierId: "SUP-002",
    supplierName: "Tata Consumer Products Supply",
    expiryDate: formatDate(180),
    status: "Low Stock",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=60"
  },
  {
    id: "PRD-104",
    name: "Aashirvaad Superior MP Sharbati Atta 5kg",
    sku: "ATTA-AASH-05",
    barcode: "8901030043812",
    category: "Groceries & Staples",
    description: "100% pure whole wheat flour processed with traditional chakki grind.",
    purchasePrice: 245.00,
    sellingPrice: 285.00,
    currentStock: 42,
    minStockLevel: 15,
    supplierId: "SUP-002",
    supplierName: "Tata Consumer Products Supply",
    expiryDate: formatDate(90),
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=60"
  },
  {
    id: "PRD-105",
    name: "Amul Butter Pasteurized 500g",
    sku: "BTR-AMUL-50",
    barcode: "8901262010112",
    category: "Dairy & Beverages",
    description: "Pure dairy butter made from fresh cream.",
    purchasePrice: 235.00,
    sellingPrice: 275.00,
    currentStock: 3,
    minStockLevel: 10, // Critical Stock!
    supplierId: "SUP-001",
    supplierName: "Amul Dairy Distributors Ltd.",
    expiryDate: formatDate(8), // Near expiry
    status: "Critical Stock",
    image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&auto=format&fit=crop&q=60"
  },
  {
    id: "PRD-106",
    name: "Epigamia Greek Yogurt Strawberry 120g",
    sku: "YOG-EPIG-12",
    barcode: "8906076120154",
    category: "Dairy & Beverages",
    description: "High protein artisan Greek yogurt with real strawberry pulp.",
    purchasePrice: 42.00,
    sellingPrice: 55.00,
    currentStock: 14,
    minStockLevel: 8,
    supplierId: "SUP-001",
    supplierName: "Amul Dairy Distributors Ltd.",
    expiryDate: formatDate(-2), // EXPIRED (for testing expiry management!)
    status: "Expired",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&auto=format&fit=crop&q=60"
  },
  {
    id: "PRD-107",
    name: "Haldiram's Bhujia Sev 400g",
    sku: "SNK-HALD-01",
    barcode: "8904004400125",
    category: "Snacks & Packaged Food",
    description: "Crispy fried spiced noodles prepared from moth bean flour.",
    purchasePrice: 85.00,
    sellingPrice: 110.00,
    currentStock: 56,
    minStockLevel: 15,
    supplierId: "SUP-004",
    supplierName: "Haldiram Snack Ventures",
    expiryDate: formatDate(150),
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1621996346565-e3d5d6281729?w=400&auto=format&fit=crop&q=60"
  },
  {
    id: "PRD-108",
    name: "Britannia Good Day Butter Cookies 200g",
    sku: "SNK-BRIT-02",
    barcode: "8901063140510",
    category: "Snacks & Packaged Food",
    description: "Rich and crunchy butter cookies packed with rich aroma.",
    purchasePrice: 38.00,
    sellingPrice: 50.00,
    currentStock: 0,
    minStockLevel: 20, // Out of Stock!
    supplierId: "SUP-004",
    supplierName: "Haldiram Snack Ventures",
    expiryDate: formatDate(200),
    status: "Out of Stock",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&auto=format&fit=crop&q=60"
  },
  {
    id: "PRD-109",
    name: "Dettol Antiseptic Liquid 550ml",
    sku: "HLT-DETT-55",
    barcode: "8901396112015",
    category: "Health & Personal Care",
    description: "Proven germ protection disinfectant for personal hygiene and first aid.",
    purchasePrice: 165.00,
    sellingPrice: 198.00,
    currentStock: 34,
    minStockLevel: 10,
    supplierId: "SUP-003",
    supplierName: "Hindustan FMCG Logistics",
    expiryDate: formatDate(500),
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=60"
  },
  {
    id: "PRD-110",
    name: "Colgate Total Clean Mint Toothpaste 150g",
    sku: "HLT-COLG-15",
    barcode: "8901314510202",
    category: "Health & Personal Care",
    description: "12-hour antibacterial defense against plaque, tartar and bad breath.",
    purchasePrice: 105.00,
    sellingPrice: 130.00,
    currentStock: 48,
    minStockLevel: 12,
    supplierId: "SUP-003",
    supplierName: "Hindustan FMCG Logistics",
    expiryDate: formatDate(420),
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1559591937-e10b1a03f42f?w=400&auto=format&fit=crop&q=60"
  },
  {
    id: "PRD-111",
    name: "Surf Excel Matic Front Load Liquid 1L",
    sku: "HOM-SURF-01",
    barcode: "8901030612056",
    category: "Home Essentials",
    description: "Powerful liquid detergent with stain-penetrating active enzymes.",
    purchasePrice: 195.00,
    sellingPrice: 235.00,
    currentStock: 22,
    minStockLevel: 10,
    supplierId: "SUP-003",
    supplierName: "Hindustan FMCG Logistics",
    expiryDate: formatDate(600),
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&auto=format&fit=crop&q=60"
  },
  {
    id: "PRD-112",
    name: "Duracell Ultra Alkaline AA Batteries 4-Pack",
    sku: "ELE-DURA-04",
    barcode: "8901030002147",
    category: "Electronics & Gadgets",
    description: "High density core batteries delivering long lasting power for smart remotes.",
    purchasePrice: 140.00,
    sellingPrice: 180.00,
    currentStock: 30,
    minStockLevel: 12,
    supplierId: "SUP-005",
    supplierName: "NexTech Electronics Importers",
    expiryDate: formatDate(1200),
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1619725002198-6a689b72f41d?w=400&auto=format&fit=crop&q=60"
  },
  {
    id: "PRD-113",
    name: "boAt 20W Fast USB-C Dual Port Wall Charger",
    sku: "ELE-BOAT-20",
    barcode: "8904321098765",
    category: "Electronics & Gadgets",
    description: "Power delivery fast adapter compatible with smartphones & tablets.",
    purchasePrice: 420.00,
    sellingPrice: 599.00,
    currentStock: 15,
    minStockLevel: 8,
    supplierId: "SUP-005",
    supplierName: "NexTech Electronics Importers",
    expiryDate: formatDate(1500),
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&auto=format&fit=crop&q=60"
  },
  {
    id: "PRD-114",
    name: "Tata Tea Gold 500g",
    sku: "TEA-TATA-50",
    barcode: "8901030383789",
    category: "Dairy & Beverages",
    description: "Fine CTC blended with long leaf teas for refreshing rich aroma.",
    purchasePrice: 280.00,
    sellingPrice: 335.00,
    currentStock: 29,
    minStockLevel: 10,
    supplierId: "SUP-002",
    supplierName: "Tata Consumer Products Supply",
    expiryDate: formatDate(300),
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=60"
  }
];

export const INITIAL_TRANSACTIONS = [
  {
    id: "TX-901",
    productId: "PRD-101",
    productName: "Amul Taaza Homogenised Toned Milk 1L",
    sku: "MILK-AMUL-01",
    type: "Stock Out",
    quantity: 12,
    previousStock: 30,
    updatedStock: 18,
    date: formatDate(-1) + " 14:32",
    reason: "POS Sale - Invoice #INV-2026-004",
    performedBy: "Store Staff (Raj)"
  },
  {
    id: "TX-902",
    productId: "PRD-102",
    productName: "Tata Salt Vacuum Evaporated 1kg",
    sku: "SALT-TATA-01",
    type: "Stock In",
    quantity: 40,
    previousStock: 45,
    updatedStock: 85,
    date: formatDate(-2) + " 10:15",
    reason: "PO Delivery - #PO-8821 Received",
    performedBy: "Warehouse Manager"
  },
  {
    id: "TX-903",
    productId: "PRD-108",
    productName: "Britannia Good Day Butter Cookies 200g",
    sku: "SNK-BRIT-02",
    type: "Stock Adjustment",
    quantity: -5,
    previousStock: 5,
    updatedStock: 0,
    date: formatDate(-2) + " 18:00",
    reason: "Damaged packaging in transit write-off",
    performedBy: "Inventory Admin"
  },
  {
    id: "TX-904",
    productId: "PRD-105",
    productName: "Amul Butter Pasteurized 500g",
    sku: "BTR-AMUL-50",
    type: "Stock Out",
    quantity: 7,
    previousStock: 10,
    updatedStock: 3,
    date: formatDate(-1) + " 11:20",
    reason: "POS Sale - Invoice #INV-2026-003",
    performedBy: "Store Staff (Raj)"
  },
  {
    id: "TX-905",
    productId: "PRD-111",
    productName: "Surf Excel Matic Front Load Liquid 1L",
    sku: "HOM-SURF-01",
    type: "Stock In",
    quantity: 15,
    previousStock: 7,
    updatedStock: 22,
    date: formatDate(-3) + " 09:45",
    reason: "Vendor replenishment batch",
    performedBy: "Warehouse Manager"
  }
];

export const INITIAL_SALES = [
  {
    id: "INV-2026-001",
    invoiceNumber: "INV-2026-001",
    customerName: "Vikas Malhotra",
    customerPhone: "+91 98210 55443",
    date: formatDate(0) + " 11:15",
    items: [
      { productId: "PRD-102", name: "Tata Salt Vacuum Evaporated 1kg", quantity: 2, price: 28, total: 56 },
      { productId: "PRD-104", name: "Aashirvaad Superior MP Sharbati Atta 5kg", quantity: 1, price: 285, total: 285 },
      { productId: "PRD-107", name: "Haldiram's Bhujia Sev 400g", quantity: 2, price: 110, total: 220 }
    ],
    subtotal: 561.00,
    discountAmount: 25.00,
    taxRate: 5, // %
    taxAmount: 26.80,
    total: 562.80,
    paymentMethod: "UPI (Google Pay)",
    status: "Completed",
    cashier: "Rajesh Kumar"
  },
  {
    id: "INV-2026-002",
    invoiceNumber: "INV-2026-002",
    customerName: "Ananya Iyer",
    customerPhone: "+91 99302 44112",
    date: formatDate(0) + " 13:40",
    items: [
      { productId: "PRD-109", name: "Dettol Antiseptic Liquid 550ml", quantity: 1, price: 198, total: 198 },
      { productId: "PRD-110", name: "Colgate Total Clean Mint Toothpaste 150g", quantity: 2, price: 130, total: 260 },
      { productId: "PRD-112", name: "Duracell Ultra Alkaline AA Batteries 4-Pack", quantity: 1, price: 180, total: 180 }
    ],
    subtotal: 638.00,
    discountAmount: 0.00,
    taxRate: 18,
    taxAmount: 114.84,
    total: 752.84,
    paymentMethod: "Credit Card",
    status: "Completed",
    cashier: "Rajesh Kumar"
  },
  {
    id: "INV-2026-003",
    invoiceNumber: "INV-2026-003",
    customerName: "Walk-in Customer",
    customerPhone: "-",
    date: formatDate(-1) + " 16:25",
    items: [
      { productId: "PRD-101", name: "Amul Taaza Homogenised Toned Milk 1L", quantity: 3, price: 72, total: 216 },
      { productId: "PRD-105", name: "Amul Butter Pasteurized 500g", quantity: 1, price: 275, total: 275 }
    ],
    subtotal: 491.00,
    discountAmount: 10.00,
    taxRate: 5,
    taxAmount: 24.05,
    total: 505.05,
    paymentMethod: "Cash",
    status: "Completed",
    cashier: "Pooja Singh"
  }
];

export const INITIAL_PURCHASE_ORDERS = [
  {
    id: "PO-8821",
    poNumber: "PO-2026-001",
    supplierId: "SUP-001",
    supplierName: "Amul Dairy Distributors Ltd.",
    status: "Completed",
    orderDate: formatDate(-5),
    expectedDelivery: formatDate(-2),
    deliveredDate: formatDate(-2),
    totalAmount: 18500.00,
    notes: "Regular bi-weekly dairy replenishment",
    items: [
      { productId: "PRD-101", name: "Amul Taaza Homogenised Toned Milk 1L", quantity: 150, unitCost: 62, totalCost: 9300, receivedQuantity: 150 },
      { productId: "PRD-105", name: "Amul Butter Pasteurized 500g", quantity: 35, unitCost: 235, totalCost: 8225, receivedQuantity: 35 }
    ]
  },
  {
    id: "PO-8822",
    poNumber: "PO-2026-002",
    supplierId: "SUP-002",
    supplierName: "Tata Consumer Products Supply",
    status: "Approved",
    orderDate: formatDate(-2),
    expectedDelivery: formatDate(1),
    deliveredDate: null,
    totalAmount: 24800.00,
    notes: "Staples bulk procurement",
    items: [
      { productId: "PRD-102", name: "Tata Salt Vacuum Evaporated 1kg", quantity: 200, unitCost: 22, totalCost: 4400, receivedQuantity: 0 },
      { productId: "PRD-103", name: "Fortune Sunlite Refined Sunflower Oil 1L", quantity: 80, unitCost: 125, totalCost: 10000, receivedQuantity: 0 },
      { productId: "PRD-104", name: "Aashirvaad Superior MP Sharbati Atta 5kg", quantity: 40, unitCost: 245, totalCost: 9800, receivedQuantity: 0 }
    ]
  },
  {
    id: "PO-8823",
    poNumber: "PO-2026-003",
    supplierId: "SUP-004",
    supplierName: "Haldiram Snack Ventures",
    status: "Pending",
    orderDate: formatDate(0),
    expectedDelivery: formatDate(2),
    deliveredDate: null,
    totalAmount: 6800.00,
    notes: "Restock out-of-stock Britannia & snacks",
    items: [
      { productId: "PRD-108", name: "Britannia Good Day Butter Cookies 200g", quantity: 100, unitCost: 38, totalCost: 3800, receivedQuantity: 0 },
      { productId: "PRD-107", name: "Haldiram's Bhujia Sev 400g", quantity: 35, unitCost: 85, totalCost: 2975, receivedQuantity: 0 }
    ]
  },
  {
    id: "PO-8824",
    poNumber: "PO-2026-004",
    supplierId: "SUP-005",
    supplierName: "NexTech Electronics Importers",
    status: "Partially Received",
    orderDate: formatDate(-4),
    expectedDelivery: formatDate(0),
    deliveredDate: null,
    totalAmount: 13200.00,
    notes: "Fast chargers batch. Supplier split shipment.",
    items: [
      { productId: "PRD-113", name: "boAt 20W Fast USB-C Dual Port Wall Charger", quantity: 25, unitCost: 420, totalCost: 10500, receivedQuantity: 15 },
      { productId: "PRD-112", name: "Duracell Ultra Alkaline AA Batteries 4-Pack", quantity: 20, unitCost: 135, totalCost: 2700, receivedQuantity: 20 }
    ]
  }
];

export const INITIAL_ALERTS = [
  {
    id: "ALT-01",
    productId: "PRD-108",
    productName: "Britannia Good Day Butter Cookies 200g",
    category: "Snacks & Packaged Food",
    currentStock: 0,
    reorderPoint: 20,
    recommendedOrderQty: 60,
    severity: "Out of Stock",
    supplierId: "SUP-004",
    supplierName: "Haldiram Snack Ventures",
    leadTimeDays: 2,
    createdAt: formatDate(0) + " 08:30",
    status: "active"
  },
  {
    id: "ALT-02",
    productId: "PRD-105",
    productName: "Amul Butter Pasteurized 500g",
    category: "Dairy & Beverages",
    currentStock: 3,
    reorderPoint: 10,
    recommendedOrderQty: 30,
    severity: "Critical Stock",
    supplierId: "SUP-001",
    supplierName: "Amul Dairy Distributors Ltd.",
    leadTimeDays: 2,
    createdAt: formatDate(-1) + " 11:20",
    status: "active"
  },
  {
    id: "ALT-03",
    productId: "PRD-103",
    productName: "Fortune Sunlite Refined Sunflower Oil 1L",
    category: "Groceries & Staples",
    currentStock: 6,
    reorderPoint: 15,
    recommendedOrderQty: 40,
    severity: "Low Stock",
    supplierId: "SUP-002",
    supplierName: "Tata Consumer Products Supply",
    leadTimeDays: 3,
    createdAt: formatDate(-1) + " 15:45",
    status: "active"
  },
  {
    id: "ALT-04",
    productId: "PRD-101",
    productName: "Amul Taaza Homogenised Toned Milk 1L",
    category: "Dairy & Beverages",
    currentStock: 18,
    reorderPoint: 25,
    recommendedOrderQty: 80,
    severity: "Low Stock",
    supplierId: "SUP-001",
    supplierName: "Amul Dairy Distributors Ltd.",
    leadTimeDays: 2,
    createdAt: formatDate(0) + " 09:10",
    status: "active"
  },
  {
    id: "ALT-05",
    productId: "PRD-106",
    productName: "Epigamia Greek Yogurt Strawberry 120g",
    category: "Dairy & Beverages",
    currentStock: 14,
    reorderPoint: 8,
    recommendedOrderQty: 0,
    severity: "Expired Product",
    supplierId: "SUP-001",
    supplierName: "Amul Dairy Distributors Ltd.",
    leadTimeDays: 2,
    createdAt: formatDate(0) + " 07:00",
    status: "active"
  }
];

export const INITIAL_WASTAGE_RECORDS = [
  {
    id: "WST-101",
    productId: "PRD-106",
    productName: "Epigamia Greek Yogurt Strawberry 120g",
    quantity: 14,
    costLost: 588.00,
    reason: "Expired shelf life prior to sale",
    date: formatDate(0),
    disposalMethod: "Bio-waste segregation",
    authorizedBy: "Store Manager"
  }
];

// Demonstration AI Forecasting Data (Pre-computed for retail demonstration mode)
export const FORECASTING_DATA = {
  modelMetadata: {
    modelName: "Ensemble Prophet-XGBoost Regressor (Demonstration Mode)",
    mae: "1.82 units",
    rmse: "2.34 units",
    r2Score: "0.938",
    accuracy: "94.2%",
    lastTrained: formatDate(-1) + " 23:30 IST",
    status: "Trained on 365 Days Synthetic Retail Transactions"
  },
  productsForecast: {
    "PRD-101": {
      name: "Amul Taaza Homogenised Toned Milk 1L",
      currentDemandRate: "16.4 units/day",
      predicted7DayTotal: 122,
      predicted15DayTotal: 268,
      predicted30DayTotal: 554,
      trend: "Rising (+14.5%)",
      safetyStockRecommended: 32,
      suggestedReorderQuantity: 90,
      confidenceInterval: "92% - 96%",
      dailyForecast: [
        { day: "Day 1", date: formatDate(1), actual: null, predicted: 17, lower: 15, upper: 19 },
        { day: "Day 2", date: formatDate(2), actual: null, predicted: 18, lower: 16, upper: 20 },
        { day: "Day 3", date: formatDate(3), actual: null, predicted: 16, lower: 14, upper: 18 },
        { day: "Day 4", date: formatDate(4), actual: null, predicted: 19, lower: 17, upper: 21 },
        { day: "Day 5", date: formatDate(5), actual: null, predicted: 21, lower: 19, upper: 23 },
        { day: "Day 6", date: formatDate(6), actual: null, predicted: 22, lower: 20, upper: 24 },
        { day: "Day 7", date: formatDate(7), actual: null, predicted: 20, lower: 18, upper: 22 }
      ],
      historicalVsPredicted: [
        { day: "-14d", actual: 14, predicted: 15 },
        { day: "-12d", actual: 16, predicted: 15 },
        { day: "-10d", actual: 15, predicted: 16 },
        { day: "-8d", actual: 18, predicted: 17 },
        { day: "-6d", actual: 17, predicted: 18 },
        { day: "-4d", actual: 19, predicted: 18 },
        { day: "-2d", actual: 18, predicted: 18 },
        { day: "Today", actual: 19, predicted: 19 },
        { day: "+2d", actual: null, predicted: 20 },
        { day: "+4d", actual: null, predicted: 21 },
        { day: "+6d", actual: null, predicted: 22 },
        { day: "+8d", actual: null, predicted: 21 },
        { day: "+10d", actual: null, predicted: 23 },
        { day: "+12d", actual: null, predicted: 24 },
        { day: "+14d", actual: null, predicted: 25 }
      ]
    },
    "PRD-102": {
      name: "Tata Salt Vacuum Evaporated 1kg",
      currentDemandRate: "4.8 units/day",
      predicted7DayTotal: 34,
      predicted15DayTotal: 74,
      predicted30DayTotal: 152,
      trend: "Stable (+1.2%)",
      safetyStockRecommended: 20,
      suggestedReorderQuantity: 50,
      confidenceInterval: "95% - 98%",
      dailyForecast: [
        { day: "Day 1", date: formatDate(1), actual: null, predicted: 5, lower: 4, upper: 6 },
        { day: "Day 2", date: formatDate(2), actual: null, predicted: 5, lower: 4, upper: 6 },
        { day: "Day 3", date: formatDate(3), actual: null, predicted: 4, lower: 3, upper: 5 },
        { day: "Day 4", date: formatDate(4), actual: null, predicted: 5, lower: 4, upper: 6 },
        { day: "Day 5", date: formatDate(5), actual: null, predicted: 6, lower: 5, upper: 7 },
        { day: "Day 6", date: formatDate(6), actual: null, predicted: 5, lower: 4, upper: 6 },
        { day: "Day 7", date: formatDate(7), actual: null, predicted: 4, lower: 3, upper: 5 }
      ],
      historicalVsPredicted: [
        { day: "-14d", actual: 5, predicted: 5 },
        { day: "-12d", actual: 4, predicted: 5 },
        { day: "-10d", actual: 5, predicted: 4 },
        { day: "-8d", actual: 6, predicted: 5 },
        { day: "-6d", actual: 5, predicted: 5 },
        { day: "-4d", actual: 4, predicted: 5 },
        { day: "-2d", actual: 5, predicted: 5 },
        { day: "Today", actual: 5, predicted: 5 },
        { day: "+2d", actual: null, predicted: 5 },
        { day: "+4d", actual: null, predicted: 5 },
        { day: "+6d", actual: null, predicted: 5 },
        { day: "+8d", actual: null, predicted: 5 },
        { day: "+10d", actual: null, predicted: 6 },
        { day: "+12d", actual: null, predicted: 5 },
        { day: "+14d", actual: null, predicted: 5 }
      ]
    },
    "PRD-105": {
      name: "Amul Butter Pasteurized 500g",
      currentDemandRate: "6.2 units/day",
      predicted7DayTotal: 46,
      predicted15DayTotal: 98,
      predicted30DayTotal: 195,
      trend: "Rising sharply (+22.1%)",
      safetyStockRecommended: 15,
      suggestedReorderQuantity: 40,
      confidenceInterval: "90% - 94%",
      dailyForecast: [
        { day: "Day 1", date: formatDate(1), actual: null, predicted: 6, lower: 5, upper: 7 },
        { day: "Day 2", date: formatDate(2), actual: null, predicted: 7, lower: 6, upper: 8 },
        { day: "Day 3", date: formatDate(3), actual: null, predicted: 6, lower: 5, upper: 7 },
        { day: "Day 4", date: formatDate(4), actual: null, predicted: 7, lower: 6, upper: 8 },
        { day: "Day 5", date: formatDate(5), actual: null, predicted: 8, lower: 7, upper: 9 },
        { day: "Day 6", date: formatDate(6), actual: null, predicted: 9, lower: 8, upper: 10 },
        { day: "Day 7", date: formatDate(7), actual: null, predicted: 7, lower: 6, upper: 8 }
      ],
      historicalVsPredicted: [
        { day: "-14d", actual: 5, predicted: 5 },
        { day: "-12d", actual: 5, predicted: 5 },
        { day: "-10d", actual: 6, predicted: 6 },
        { day: "-8d", actual: 6, predicted: 6 },
        { day: "-6d", actual: 7, predicted: 6 },
        { day: "-4d", actual: 7, predicted: 7 },
        { day: "-2d", actual: 8, predicted: 7 },
        { day: "Today", actual: 8, predicted: 8 },
        { day: "+2d", actual: null, predicted: 8 },
        { day: "+4d", actual: null, predicted: 9 },
        { day: "+6d", actual: null, predicted: 9 },
        { day: "+8d", actual: null, predicted: 10 },
        { day: "+10d", actual: null, predicted: 10 },
        { day: "+12d", actual: null, predicted: 11 },
        { day: "+14d", actual: null, predicted: 11 }
      ]
    }
  }
};

export const ANOMALY_RECORDS = [
  {
    id: "ANOM-01",
    date: formatDate(-3),
    productName: "Amul Taaza Homogenised Toned Milk 1L",
    detectedType: "Demand Spike (+84% above rolling 7d mean)",
    impact: "Stock depleted 1.8 days earlier than scheduled",
    suspectedCause: "Local holiday festival demand",
    status: "Verified",
    confidence: "96.4%"
  },
  {
    id: "ANOM-02",
    date: formatDate(-5),
    productName: "boAt 20W Fast USB-C Dual Port Wall Charger",
    detectedType: "Sudden Dip in Sales (-60%)",
    impact: "Excess capital locked in stock",
    suspectedCause: "Nearby competitor flash discount",
    status: "Investigating",
    confidence: "91.8%"
  },
  {
    id: "ANOM-03",
    date: formatDate(-1),
    productName: "Britannia Good Day Butter Cookies 200g",
    detectedType: "Rapid Stockout Anomaly",
    impact: "Lost sales estimated at ₹ 1,450",
    suspectedCause: "Unfulfilled PO #PO-8823 delayed by supplier",
    status: "Action Required",
    confidence: "98.2%"
  }
];

export const INITIAL_SETTINGS = {
  store: {
    name: "Stockify Supermart & Retail Hub",
    storeCode: "STK-BLR-04",
    gstNumber: "29AABCU9603R1ZM",
    currency: "₹",
    currencyCode: "INR",
    taxRate: 5, // default 5%
    phone: "+91 80 4123 9900",
    email: "contact@stockify-retail.com",
    address: "42 Outer Ring Road, Bellandur, Bengaluru, Karnataka - 560103",
    receiptHeader: "Thank you for shopping at Stockify Supermart!",
    receiptFooter: "Goods once sold can be exchanged within 7 days with valid receipt."
  },
  preferences: {
    lowStockThresholdGlobal: 15,
    expiryAlertDays: 30,
    enableEmailAlerts: true,
    enableSoundEffects: true,
    autoPrintReceipt: false,
    darkMode: false,
    compactView: false
  },
  currentUser: {
    id: "USR-001",
    name: "Priyam Saini",
    email: "priyam.saini@stockify.io",
    role: "Admin", // 'Admin', 'Manager', 'Staff'
    designation: "Principal Inventory Director",
    department: "Operations & Supply Chain",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
  },
  teamMembers: [
    { id: "USR-001", name: "Priyam Saini", email: "priyam.saini@stockify.io", role: "Admin", status: "Active" },
    { id: "USR-002", name: "Sunil Hegde", email: "sunil.hegde@stockify.io", role: "Manager", status: "Active" },
    { id: "USR-003", name: "Rajesh Kumar", email: "rajesh.pos@stockify.io", role: "Staff", status: "Active" },
    { id: "USR-004", name: "Pooja Singh", email: "pooja.singh@stockify.io", role: "Staff", status: "Active" }
  ]
};
