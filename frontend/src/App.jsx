import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Inventory } from './pages/Inventory';
import { Suppliers } from './pages/Suppliers';
import { POS } from './pages/POS';
import { Sales } from './pages/Sales';
import { Forecasting } from './pages/Forecasting';
import { Alerts } from './pages/Alerts';
import { PurchaseOrders } from './pages/PurchaseOrders';
import { ExpiryManagement } from './pages/ExpiryManagement';
import { Analytics } from './pages/Analytics';
import { CSVManagement } from './pages/CSVManagement';
import { AIAssistant } from './pages/AIAssistant';
import { Settings } from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/forecasting" element={<Forecasting />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/expiry" element={<ExpiryManagement />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/csv" element={<CSVManagement />} />
            <Route path="/assistant" element={<AIAssistant />} />
            <Route path="/settings" element={<Settings />} />
            {/* Fallback: redirect unknown routes to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
