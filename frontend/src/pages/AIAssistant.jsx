import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { BotMessageSquare, Send, Sparkles, User, RefreshCw, Package, TrendingUp, AlertTriangle, Truck, Calendar, ChevronRight } from 'lucide-react';

// Pre-built Retail AI Response Engine (Demo Mode)
const buildAIResponse = (message, { products, sales, alerts, suppliers, purchaseOrders, settings, stats }) => {
  const lowerMsg = message.toLowerCase().trim();

  // ──────────────────── HELPER COMPUTATIONS ────────────────────
  const lowStockItems = products.filter(p => p.currentStock > 0 && p.currentStock <= p.minStockLevel);
  const outOfStockItems = products.filter(p => p.currentStock === 0);
  const criticalItems = products.filter(p => p.currentStock > 0 && p.currentStock <= Math.floor(p.minStockLevel / 2));

  const today = new Date().toISOString().split('T')[0];
  const expiredItems = products.filter(p => p.expiryDate && p.expiryDate < today);
  const nearExpiryItems = products.filter(p => {
    if (!p.expiryDate) return false;
    const diff = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 30;
  });

  // Top selling from sales data
  const itemVolumes = {};
  sales.forEach(s => s.items.forEach(i => { itemVolumes[i.name] = (itemVolumes[i.name] || 0) + i.quantity; }));
  const topSellers = Object.entries(itemVolumes).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const totalRevenue = sales.reduce((acc, s) => acc + Number(s.total || 0), 0);
  const currency = settings.store.currency;

  // ──────────────────── INTENT MATCHING ────────────────────
  if (lowerMsg.includes('low stock') || lowerMsg.includes('running low') || lowerMsg.includes('low inventory')) {
    if (lowStockItems.length === 0 && outOfStockItems.length === 0) {
      return {
        text: `✅ **Great news!** All ${products.length} products currently have stock levels above their safety thresholds. No restock action is required at this time.`,
        type: 'success',
        suggestions: ['Show me top-selling products', 'What is my revenue today?', 'Show me near-expiry items']
      };
    }
    const lines = [
      `📦 **${lowStockItems.length + outOfStockItems.length} products** need your immediate attention:\n`,
      ...outOfStockItems.map(p => `• 🔴 **${p.name}** — OUT OF STOCK (Min: ${p.minStockLevel})`),
      ...criticalItems.filter(p => p.currentStock > 0).map(p => `• 🟠 **${p.name}** — CRITICAL: ${p.currentStock} units left (Min: ${p.minStockLevel})`),
      ...lowStockItems.filter(p => p.currentStock > Math.floor(p.minStockLevel / 2)).map(p => `• 🟡 **${p.name}** — Low: ${p.currentStock}/${p.minStockLevel} units`),
      `\n💡 Tip: Navigate to **Smart Alerts** to create Purchase Orders directly from alert cards.`
    ];
    return {
      text: lines.join('\n'),
      type: 'warning',
      suggestions: ['Which products should I reorder?', 'Create purchase orders', 'Show me out-of-stock items']
    };
  }

  if (lowerMsg.includes('reorder') || lowerMsg.includes('replenish') || lowerMsg.includes('order more') || lowerMsg.includes('purchase order')) {
    const reorderItems = [...outOfStockItems, ...lowStockItems].slice(0, 5);
    const lines = [
      `🛒 **Recommended Reorder Priority Queue** (based on live stock vs. safety thresholds):\n`,
      ...reorderItems.map((p, i) =>
        `${i + 1}. **${p.name}**\n   Current: ${p.currentStock} | Min: ${p.minStockLevel} | Suggested Order: **+${Math.max(p.minStockLevel * 3, 20)} units** via ${p.supplierName || 'default supplier'}`
      ),
      `\n🔗 Go to **Purchase Orders** to issue procurement requests for these items.`
    ];
    return {
      text: lines.join('\n'),
      type: 'info',
      suggestions: ['What are my top-selling products?', 'Which items are low in stock?', 'Show supplier lead times']
    };
  }

  if (lowerMsg.includes('top sell') || lowerMsg.includes('best sell') || lowerMsg.includes('popular product') || lowerMsg.includes('fast moving')) {
    if (topSellers.length === 0) {
      return {
        text: `📊 No POS sales data has been recorded yet. Complete some sales through the **POS Register** to see product velocity analytics.`,
        type: 'info',
        suggestions: ['Show me low stock items', 'What is my total revenue?']
      };
    }
    const lines = [
      `🏆 **Top-Selling Products by Volume** (from ${sales.length} recorded POS invoices):\n`,
      ...topSellers.map(([name, qty], i) =>
        `${i + 1}. **${name.length > 35 ? name.slice(0, 35) + '...' : name}** — ${qty} units sold`
      ),
      `\n📈 For detailed revenue charts and category breakdowns, check **Sales Analytics**.`
    ];
    return {
      text: lines.join('\n'),
      type: 'success',
      suggestions: ['Show slow-moving products', 'What is my total revenue?', 'Which products are low in stock?']
    };
  }

  if (lowerMsg.includes('expir') || lowerMsg.includes('near expiry') || lowerMsg.includes('expired') || lowerMsg.includes('shelf life')) {
    if (expiredItems.length === 0 && nearExpiryItems.length === 0) {
      return {
        text: `✅ **All clear on expiry!** None of your ${products.filter(p => p.expiryDate).length} products with expiry dates are currently past or near their shelf-life limit.`,
        type: 'success',
        suggestions: ['Show me low stock items', 'Show me top-selling products']
      };
    }
    const lines = [
      `⚠️ **Shelf Life Alert Summary:**\n`,
      expiredItems.length > 0
        ? `• 🔴 **${expiredItems.length} EXPIRED items** — Immediate disposal write-off required:\n${expiredItems.map(p => `  → ${p.name} (Expired: ${p.expiryDate}, Stock: ${p.currentStock})`).join('\n')}`
        : '',
      nearExpiryItems.length > 0
        ? `• 🟡 **${nearExpiryItems.length} Near-Expiry items** (≤30 days remaining):\n${nearExpiryItems.map(p => `  → ${p.name} (Expires: ${p.expiryDate}, Stock: ${p.currentStock})`).join('\n')}`
        : '',
      `\n💡 Navigate to **Expiry Tracking** to record wastage write-offs or apply promotional discounts.`
    ].filter(Boolean);
    return {
      text: lines.join('\n'),
      type: 'warning',
      suggestions: ['How do I write off expired items?', 'Show me low stock alerts', 'Show me near-expiry products']
    };
  }

  if (lowerMsg.includes('revenue') || lowerMsg.includes('sales today') || lowerMsg.includes('how much') || lowerMsg.includes('earnings')) {
    return {
      text: `💰 **Revenue Summary for ${settings.store.name}:**\n\n• **Today's Sales:** ${formatCurrency(stats.todaySalesRevenue, currency)} (${stats.todaySalesCount} orders)\n• **Total Recorded Revenue:** ${formatCurrency(totalRevenue, currency)} across ${sales.length} invoices\n• **Average Ticket Size:** ${formatCurrency(sales.length ? totalRevenue / sales.length : 0, currency)}\n• **Inventory Valuation (at cost):** ${formatCurrency(stats.inventoryValuation, currency)}\n\n📊 For monthly trends and category-wise breakdown, navigate to **Sales Analytics**.`,
      type: 'info',
      suggestions: ['Show me top-selling products', 'Which products are low in stock?', 'Show me monthly revenue trends']
    };
  }

  if (lowerMsg.includes('supplier') || lowerMsg.includes('vendor') || lowerMsg.includes('lead time')) {
    const lines = [
      `🚛 **Active Supplier Network (${suppliers.length} Vendors):**\n`,
      ...suppliers.slice(0, 4).map(s =>
        `• **${s.name}**\n  Contact: ${s.contactPerson} | Lead Time: ${s.leadTime} days | ${s.phone}`
      ),
      `\n📋 Manage supplier profiles and issue POs from the **Suppliers** and **Purchase Orders** modules.`
    ];
    return {
      text: lines.join('\n'),
      type: 'info',
      suggestions: ['Which products should I reorder?', 'Show me pending purchase orders', 'Show me low stock items']
    };
  }

  if (lowerMsg.includes('purchase order') || lowerMsg.includes('pending') || lowerMsg.includes('po status') || lowerMsg.includes('delivery')) {
    const pending = purchaseOrders.filter(po => po.status === 'Pending' || po.status === 'Approved');
    const lines = [
      `📋 **Purchase Order Status:**\n`,
      `• **Pending / Approved POs:** ${pending.length} awaiting delivery`,
      ...pending.slice(0, 3).map(po =>
        `  → ${po.poNumber} | ${po.supplierName} | ${formatCurrency(po.totalAmount, currency)} | Expected: ${po.expectedDelivery}`
      ),
      `\n📦 Navigate to **Purchase Orders** to approve, receive goods, or create new POs.`
    ];
    return {
      text: lines.join('\n'),
      type: 'info',
      suggestions: ['Which products should I reorder?', 'Show me low stock items', 'Show my suppliers']
    };
  }

  if (lowerMsg.includes('inventory') || lowerMsg.includes('total stock') || lowerMsg.includes('stock value') || lowerMsg.includes('valuation')) {
    return {
      text: `📦 **Inventory Overview for ${settings.store.name}:**\n\n• **Total SKUs:** ${stats.totalProducts} products in catalog\n• **Total Stock Units:** ${stats.totalInventoryQty.toLocaleString()} physical units\n• **Inventory Valuation (cost basis):** ${formatCurrency(stats.inventoryValuation, currency)}\n• **Potential Revenue (at retail price):** ${formatCurrency(stats.potentialRevenue, currency)}\n• **Low Stock SKUs:** ${stats.lowStockCount}\n• **Out of Stock SKUs:** ${stats.outOfStockCount}\n\nUse **Inventory** module to record Stock In, Stock Out, or run audit adjustments.`,
      type: 'info',
      suggestions: ['What are the low stock items?', 'Show me inventory valuation by category', 'Create purchase order']
    };
  }

  if (lowerMsg.includes('forecast') || lowerMsg.includes('demand') || lowerMsg.includes('predict') || lowerMsg.includes('milk')) {
    const milkProd = products.find(p => p.name.toLowerCase().includes('milk'));
    if (milkProd) {
      return {
        text: `🧠 **AI Demand Forecast — ${milkProd.name}:**\n\n• **Current Stock:** ${milkProd.currentStock} units\n• **Current Demand Rate:** ~16–18 units/day (trending upward +14.5%)\n• **7-Day Projected Demand:** ~122 units\n• **15-Day Projected Demand:** ~268 units\n• **Safety Stock Recommended:** 32 units minimum\n• **Suggested Reorder Quantity:** +90 units from ${milkProd.supplierName}\n\n📈 **Model:** Ensemble Prophet + XGBoost (Demonstration Mode)\n\nNavigate to **AI Forecasting** for full day-by-day prediction charts and historical vs. predicted overlays.`,
        type: 'info',
        suggestions: ['How much milk should I reorder?', 'Show me expiry status for dairy', 'Show me all low stock items']
      };
    }
    return {
      text: `🧠 Navigate to the **AI Forecasting** module for detailed product-wise 7, 15, and 30-day demand predictions with historical vs. predicted charts and model performance metrics.`,
      type: 'info',
      suggestions: ['Show me low stock items', 'Show me top-selling products']
    };
  }

  if (lowerMsg.includes('help') || lowerMsg.includes('what can you') || lowerMsg.includes('what do you') || lowerMsg === '') {
    return {
      text: `👋 **Hello! I'm the Stockify AI Inventory Assistant.**\n\nI can help you with real-time insights from your store data. Try asking me:\n\n• 📦 "Which products are running low?"\n• 🛒 "What products should I reorder today?"\n• 🏆 "What are my top-selling products?"\n• ⚠️ "Which products are near expiry?"\n• 💰 "What is my total revenue?"\n• 🔮 "What is the expected demand for milk?"\n• 🚛 "Show me my supplier information"\n• 📋 "What is the status of my purchase orders?"\n\n*Note: This assistant uses live frontend data from your ${settings.store.name} inventory store.*`,
      type: 'info',
      suggestions: ['Which products are running low?', 'What are my top-selling products?', 'Which products are near expiry?', 'What is my total revenue?']
    };
  }

  // Default fallback
  return {
    text: `🤔 I couldn't find a specific answer for **"${message}"**.\n\nI'm currently able to answer questions about:\n• Stock levels and low-stock alerts\n• Product demand forecasting\n• Revenue and sales performance\n• Expiry and shelf-life status\n• Purchase orders and suppliers\n\nTry rephrasing your query or use one of the quick suggestions below!`,
    type: 'default',
    suggestions: ['Which products are running low?', 'Show me top-selling products', 'Which items are near expiry?', 'What is my revenue today?']
  };
};

export const AIAssistant = () => {
  const appData = useApp();
  const { products, sales, alerts, suppliers, purchaseOrders, settings, stats } = appData;

  const INITIAL_MESSAGE = {
    id: 'welcome',
    role: 'assistant',
    text: `👋 **Welcome to Stockify AI Assistant!**\n\nI have live access to your ${settings.store.name} inventory data. I can answer questions about stock levels, demand forecasts, expiry risks, revenue, and supplier performance.\n\nAsk me anything, or choose a quick question below to get started!`,
    type: 'info',
    suggestions: ['Which products are running low?', 'What are my top-selling products?', 'Which items are near expiry?', 'What is my revenue today?'],
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text = inputText.trim()) => {
    if (!text) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking delay
    await new Promise(res => setTimeout(res, 600 + Math.random() * 400));

    const response = buildAIResponse(text, { products, sales, alerts, suppliers, purchaseOrders, settings, stats });

    const assistantMsg = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      text: response.text,
      type: response.type,
      suggestions: response.suggestions,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setIsTyping(false);
    setMessages(prev => [...prev, assistantMsg]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
    setInputText('');
    setIsTyping(false);
    inputRef.current?.focus();
  };

  // Simple markdown-like text renderer
  const renderText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bold **text**
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const rendered = parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part
      );
      return (
        <span key={idx} className="block leading-relaxed">
          {rendered}
        </span>
      );
    });
  };

  const QUICK_PROMPTS = [
    { icon: Package, text: 'Which products are running low?' },
    { icon: TrendingUp, text: 'What are my top-selling products?' },
    { icon: AlertTriangle, text: 'Which items are near expiry?' },
    { icon: Truck, text: 'Show me my supplier info' },
    { icon: Calendar, text: 'What is my total revenue?' },
    { icon: Sparkles, text: 'Forecast demand for milk' }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] max-h-[820px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <BotMessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Stockify AI Assistant
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 uppercase tracking-wide flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> Demo Mode
              </span>
            </h2>
            <p className="text-xs text-slate-400">Live inventory data • Natural language Q&A • Ready for GPT/Gemini backend</p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="Reset conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Chat
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            {msg.role === 'assistant' ? (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0 mt-0.5">
                <BotMessageSquare className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}

            {/* Bubble */}
            <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-soft rounded-tl-sm'
                }`}
              >
                {renderText(msg.text)}
              </div>

              <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>

              {/* Suggestion Pills (only for assistant messages) */}
              {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {msg.suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(s)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-full transition-colors"
                    >
                      {s}
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0">
              <BotMessageSquare className="w-4 h-4" />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"></div>
                <span className="text-[11px] text-slate-400 ml-1">Stockify AI is analyzing your inventory...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Pills */}
      {messages.length <= 2 && (
        <div className="py-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2 px-1">Quick Questions</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.text)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors text-left"
              >
                <qp.icon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate">{qp.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-end gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-soft focus-within:border-blue-500 transition-colors">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about stock levels, demand forecasts, revenue, expiry alerts..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none py-1.5 px-2 max-h-24"
            style={{ overflow: 'hidden' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
            className="shrink-0 w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 px-1 text-center">
          Powered by Stockify AI Demo Engine • Future integration: Google Gemini / OpenAI GPT-4o
        </p>
      </div>
    </div>
  );
};
