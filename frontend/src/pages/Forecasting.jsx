import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FORECASTING_DATA } from '../data/mockData';
import {
  BrainCircuit,
  Sparkles,
  Info,
  Calendar,
  Activity,
  ArrowUpRight,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

export const Forecasting = () => {
  const { products, addToast } = useApp();
  const [selectedProductId, setSelectedProductId] = useState('PRD-101');
  const [forecastHorizon, setForecastHorizon] = useState('7'); // '7' | '15' | '30'

  const forecast = FORECASTING_DATA.productsForecast[selectedProductId] || FORECASTING_DATA.productsForecast['PRD-101'];
  const metadata = FORECASTING_DATA.modelMetadata;

  const handleRetrainSimulation = () => {
    addToast('Simulating ML pipeline training with scikit-learn / Prophet...', 'info');
    setTimeout(() => {
      addToast('Model hyperparameters optimized. Forecast refreshed!', 'success');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              AI Demand Forecasting
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 rounded-full border border-amber-300 dark:border-amber-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Demo Data Mode
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Predict future retail stockout risks using regression modeling and seasonal smoothing
          </p>
        </div>

        <button
          onClick={handleRetrainSimulation}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Simulate Model Re-run
        </button>
      </div>

      {/* Mandatory Demonstration Notice Banner */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <strong className="font-bold">Project Phase 1 Architectural Notice:</strong> The forecasts, trend projections, and accuracy indicators shown below are pre-computed demonstration data intended for UI/UX validation and frontend state design. The production Python machine learning pipeline (FastAPI + Scikit-learn / Prophet / XGBoost) will be attached in the subsequent backend phase without altering UI contracts.
        </div>
      </div>

      {/* Product Selector & Horizon Toggle */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-soft flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex-1 max-w-md">
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
            Target Product for Prediction
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
          >
            {Object.keys(FORECASTING_DATA.productsForecast).map((pId) => {
              const p = products.find(prod => prod.id === pId);
              return (
                <option key={pId} value={pId}>
                  {p ? p.name : FORECASTING_DATA.productsForecast[pId].name} ({pId})
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Forecast Horizon:</span>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            {['7', '15', '30'].map((h) => (
              <button
                key={h}
                onClick={() => setForecastHorizon(h)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  forecastHorizon === h
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {h} Days
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Model Predictions Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-soft">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">7-Day Projected Demand</span>
          <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 block">
            {forecast.predicted7DayTotal} units
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Avg {forecast.currentDemandRate}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-soft">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">15-Day Projected Demand</span>
          <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 block">
            {forecast.predicted15DayTotal} units
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">{forecast.trend}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-soft">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">30-Day Monthly Estimate</span>
          <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1 block">
            {forecast.predicted30DayTotal} units
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Confidence: {forecast.confidenceInterval}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-soft">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Recommended Safety Restock</span>
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
            +{forecast.suggestedReorderQuantity} units
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Safety buffer: {forecast.safetyStockRecommended} units</span>
        </div>
      </div>

      {/* Main Charts: Actual vs Predicted Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dual Line Chart (Actual vs Predicted) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Actual Sales vs Predicted Curve (Time-Series)
              </h3>
              <p className="text-xs text-slate-400">Past 14 days actuals alongside next 14 days ML projected demand</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              R² = {metadata.r2Score}
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecast.historicalVsPredicted}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val, name) => [val ? `${val} units` : 'N/A', name === 'actual' ? 'Actual Sales' : 'Forecasted Demand']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', borderColor: '#1e293b', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Historical Actual Demand"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="AI Forecast Model"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7-Day Day-by-Day Forecast Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Predicted Velocity</h3>
            <p className="text-xs text-slate-400">Daily forecast with upper/lower bounds</p>

            <div className="mt-4 space-y-2">
              {forecast.dailyForecast.map((df) => (
                <div
                  key={df.day}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{df.day}</span>
                    <span className="text-[10px] text-slate-400 block">{df.date}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                      {df.predicted} units
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Range: {df.lower} - {df.upper}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Model Performance & Architecture Details */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-soft">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <BrainCircuit className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Model Evaluation Diagnostics & Parameters
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Algorithm Engine</span>
            <span className="font-bold text-slate-900 dark:text-white mt-1 block">
              {metadata.modelName}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Mean Absolute Error (MAE)</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
              {metadata.mae}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Root Mean Square (RMSE)</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
              {metadata.rmse}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Forecast Generation Date</span>
            <span className="font-bold text-slate-900 dark:text-white mt-1 block">
              {metadata.lastTrained}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
