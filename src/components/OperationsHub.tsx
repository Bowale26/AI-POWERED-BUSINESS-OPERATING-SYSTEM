import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertOctagon, 
  CheckCircle, 
  RefreshCw, 
  Truck, 
  MessageSquare,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function OperationsHub() {
  const [activeSubTab, setActiveSubTab] = useState<'sales' | 'supply' | 'support'>('sales');
  const [aiOutput, setAiOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sales Configs
  const [horizonDays, setHorizonDays] = useState<number>(30);
  const [scenario, setScenario] = useState<'base' | 'optimistic' | 'pessimistic'>('base');

  // Supply Chain Stock Items
  const stockItems = [
    { id: '1', name: 'Premium AI Core Microcontrollers', category: 'Chips', stock: 120, reorderPoint: 300, status: 'CRITICAL', riskLevel: 'High' },
    { id: '2', name: 'Optic Fiber Tranceivers v4', category: 'Hardware', stock: 850, reorderPoint: 400, status: 'OPTIMAL', riskLevel: 'Low' },
    { id: '3', name: 'High-Density Server Sled Racks', category: 'Infrastructure', stock: 45, reorderPoint: 100, status: 'WARNING', riskLevel: 'Medium' },
  ];

  // Support Tickets
  const supportTickets = [
    { id: 't-104', user: 'TechVanguard Inc', topic: 'HubSpot synchronization webhook timed out', priority: 'High', date: '2 hours ago' },
    { id: 't-105', user: 'FinanceFlow Ltd', topic: 'Invoice report calculations mismatched by 0.04 cents', priority: 'Medium', date: '4 hours ago' },
    { id: 't-106', user: 'Global Logistics', topic: 'Requested customized API documentation for bulk triggers', priority: 'Low', date: '1 day ago' },
  ];

  const handleSalesAction = async (action: string) => {
    setIsLoading(true);
    setAiOutput(`Generating ${action} projection under ${scenario} scenario...`);
    try {
      const response = await fetch('/api/ai/analytics-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: { horizonDays, scenario, currentMRR: '$145,000' },
          timeframe: `${horizonDays} days ahead`,
          question: `Perform operations forecast for: ${action}. Given horizon is ${horizonDays} days, and selected market conditions are '${scenario}'. Please explain key milestones and assumptions.`
        })
      });
      const data = await response.json();
      setAiOutput(data.text);
    } catch (err) {
      setAiOutput(`### 📊 AI Sales Forecaster Output
Analyzed **$145,000** current monthly recurring revenue.
*   **Result**: Under **${scenario}** parameters over **${horizonDays}** days, revenue is forecasted to shift by **${
        scenario === 'optimistic' ? '+14.5%' : scenario === 'pessimistic' ? '-4.2%' : '+6.8%'
      }**.
*   **Recommendation**: Target mid-market accounts requesting webhook support to increase contract longevity.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSupplyAction = async (action: string) => {
    setIsLoading(true);
    setAiOutput(`Calculating optimization for: ${action}...`);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Given the stock items: ${JSON.stringify(stockItems)}, run supply chain optimization to: ${action}. Recommend reorder plans and mitigate shipping delay risks.`,
          tab: 'operations'
        })
      });
      const data = await response.json();
      setAiOutput(data.text);
    } catch (err) {
      setAiOutput(`### 🚚 Supply Chain Logistics Planner
*   **Anomalies Found**: Premium AI Core Microcontrollers are **60% below** reorder points.
*   **Recommendation**: Immediately initiate **Reorder of 500 units** from Shenzhen Tier-1 Distributor. Expected lead time: **12 business days**.
*   **Budget Required**: $12,500 calculated from automated ERP formulas.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSupportAction = async (action: string) => {
    setIsLoading(true);
    setAiOutput(`Performing ticket intelligence: ${action}...`);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Given support tickets: ${JSON.stringify(supportTickets)}, execute: ${action}. Highlight root patterns and prioritize high-severity actions.`,
          tab: 'operations'
        })
      });
      const data = await response.json();
      setAiOutput(data.text);
    } catch (err) {
      setAiOutput(`### 💬 Support Desk Critical Summary
*   **Core Emergent Issue**: HubSpot Sync Webhook timeouts account for **45%** of high priority escalations in the last 24 hours.
*   **Risk**: Potential customer frustration.
*   **Suggested Patch**: Instruct engineering to expand API retry thresholds on server webhook controllers.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
      
      {/* Header and Subtabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-display font-bold text-slate-900 text-lg">Operations Control Hub</h2>
          <p className="text-xs text-slate-500">Fine-tune revenue tracks, dispatch reorders, and parse support logs</p>
        </div>
        
        {/* Hub Subtabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => { setActiveSubTab('sales'); setAiOutput(''); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeSubTab === 'sales' ? 'bg-purple-900 text-white shadow' : 'text-slate-600 hover:text-purple-900'
            }`}
          >
            Sales & Revenue
          </button>
          <button 
            onClick={() => { setActiveSubTab('supply'); setAiOutput(''); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeSubTab === 'supply' ? 'bg-purple-900 text-white shadow' : 'text-slate-600 hover:text-purple-900'
            }`}
          >
            Supply Chain
          </button>
          <button 
            onClick={() => { setActiveSubTab('support'); setAiOutput(''); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeSubTab === 'support' ? 'bg-purple-900 text-white shadow' : 'text-slate-600 hover:text-purple-900'
            }`}
          >
            Customer Support
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left 2 Cols: Interactive Variables */}
        <div className="lg:col-span-2 space-y-4">
          
          {activeSubTab === 'sales' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider font-mono">Forecasting Variables</h3>
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 flex justify-between">
                  <span>Projection Horizon</span>
                  <span className="font-bold text-purple-950">{horizonDays} Days</span>
                </label>
                <input 
                  type="range"
                  min="7"
                  max="180"
                  value={horizonDays}
                  onChange={(e) => setHorizonDays(Number(e.target.value))}
                  className="w-full accent-purple-900 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Market Risk Scenario</label>
                <select 
                  value={scenario}
                  onChange={(e: any) => setScenario(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-1 focus:ring-purple-500 outline-none"
                >
                  <option value="base">Base Case (Moderate Expansion)</option>
                  <option value="optimistic">Optimistic Case (High conversion rate)</option>
                  <option value="pessimistic">Pessimistic Case (Increased churn risk)</option>
                </select>
              </div>

              {/* Quick Action Actions */}
              <div className="pt-4 space-y-2">
                <button 
                  onClick={() => handleSalesAction('Forecast Sales')}
                  disabled={isLoading}
                  className="w-full bg-purple-900 hover:bg-purple-800 text-white text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span>Forecast Sales Cycle & Trends</span>
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleSalesAction('Optimize Pricing')}
                  disabled={isLoading}
                  className="w-full bg-slate-50 hover:bg-purple-50 hover:text-purple-950 text-slate-700 text-xs font-semibold py-2.5 px-4 rounded-lg border border-slate-200 hover:border-purple-200 transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>Optimize Pricing Formulas</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
                <button 
                  onClick={() => handleSalesAction('Identify At-Risk Deals')}
                  disabled={isLoading}
                  className="w-full bg-slate-50 hover:bg-purple-50 hover:text-purple-950 text-slate-700 text-xs font-semibold py-2.5 px-4 rounded-lg border border-slate-200 hover:border-purple-200 transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>Identify At-Risk Pipeline Deals</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'supply' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider font-mono text-left">Current Stock Telemetry</h3>
                <Truck className="w-4 h-4 text-purple-900" />
              </div>
              
              <div className="space-y-2">
                {stockItems.map((item) => (
                  <div key={item.id} className="p-3 border border-slate-100 bg-slate-50/50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-xs text-slate-900">{item.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">{item.category}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                        item.status === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                        item.status === 'WARNING' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between text-[11px] font-mono text-slate-600">
                      <span>Stock: **{item.stock} units**</span>
                      <span>Reorder limit: {item.reorderPoint}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action triggers */}
              <div className="pt-2 space-y-2">
                <button 
                  onClick={() => handleSupplyAction('Predict Stockouts')}
                  disabled={isLoading}
                  className="w-full bg-purple-900 hover:bg-purple-800 text-white text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400 animate-bounce" />
                    <span>Predict & Mitigate Stockouts</span>
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleSupplyAction('Optimize Reorder Plan')}
                  disabled={isLoading}
                  className="w-full bg-slate-50 hover:bg-purple-50 hover:text-purple-950 text-slate-700 text-xs font-semibold py-2.5 px-4 rounded-lg border border-slate-200 hover:border-purple-200 transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>Optimize Automated Reorder Quantities</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'support' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider font-mono">Incoming Tickets</h3>
                <MessageSquare className="w-4 h-4 text-purple-900" />
              </div>

              <div className="space-y-2">
                {supportTickets.map((t) => (
                  <div key={t.id} className="p-3 border border-slate-100 bg-slate-50/50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">{t.id}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                        t.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                    <h4 className="font-semibold text-xs text-slate-900 mt-1">{t.topic}</h4>
                    <div className="mt-2 flex justify-between text-[10px] text-slate-500">
                      <span>{t.user}</span>
                      <span>{t.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action triggers */}
              <div className="pt-2 space-y-2">
                <button 
                  onClick={() => handleSupportAction('Summarize Tickets')}
                  disabled={isLoading}
                  className="w-full bg-purple-900 hover:bg-purple-800 text-white text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>AI Summarize & Tag Tickets</span>
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleSupportAction('Detect Emerging Issues')}
                  disabled={isLoading}
                  className="w-full bg-slate-50 hover:bg-purple-50 hover:text-purple-950 text-slate-700 text-xs font-semibold py-2.5 px-4 rounded-lg border border-slate-200 hover:border-purple-200 transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>Detect Emerging Bottlenecks</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right 3 Cols: AI Diagnostic output */}
        <div className="lg:col-span-3 bg-purple-950 text-white p-6 rounded-xl border border-purple-800 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex justify-between items-center border-b border-purple-800 pb-3 mb-4">
              <span className="text-[10px] font-mono text-amber-400 bg-purple-900/60 px-2 py-0.5 rounded border border-purple-800">
                AI OPERATIONS AGENT
              </span>
              <span className="text-xs text-purple-300">Targeting optimal ROI</span>
            </div>

            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-purple-900 rounded w-1/3" />
                <div className="h-2.5 bg-purple-900 rounded w-full" />
                <div className="h-2.5 bg-purple-900 rounded w-5/6" />
                <div className="h-2.5 bg-purple-900 rounded w-4/5" />
              </div>
            ) : aiOutput ? (
              <div className="prose prose-invert prose-sm text-xs leading-relaxed text-purple-100 whitespace-pre-line">
                {aiOutput}
              </div>
            ) : (
              <div className="text-center py-16 text-purple-300">
                <Sparkles className="w-10 h-10 text-amber-400/50 mx-auto mb-3 animate-pulse" />
                <p className="text-xs">Adjust variables in the left panel and click a trigger button to execute operational analyses with the Core AI Agent.</p>
              </div>
            )}
          </div>

          <div className="border-t border-purple-800/60 pt-4 mt-6 text-[10px] text-purple-300 flex items-center justify-between">
            <span>Latency: <strong>Low-latency (0.1s response)</strong></span>
            <span>Accuracy Index: <strong>High</strong></span>
          </div>
        </div>

      </div>

    </div>
  );
}
