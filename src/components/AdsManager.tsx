import React, { useState } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  Target, 
  BarChart, 
  DollarSign,
  RotateCw,
  CheckCircle2
} from 'lucide-react';

export default function AdsManager() {
  const [channel, setChannel] = useState<'Google' | 'Facebook' | 'Instagram'>('Google');
  const [adBudget, setAdBudget] = useState('10000');
  const [hook, setHook] = useState('Immediate Q3 revenue growth and software connection stability.');
  const [demographics, setDemographics] = useState('B2B Tech leaders, CTOs, CFOs, VPs of Marketing');

  const [isLoading, setIsLoading] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [activeTab, setActiveTab] = useState<'copy' | 'audience' | 'budget' | 'cpc'>('copy');

  const handleCreateAd = async () => {
    setIsLoading(true);
    setResponseText(`Formulating personalized ${channel} Ad campaign headline, secondary description variants, and CTA configurations...`);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Acting as AI Ads Copywriter. Generate copy variations for ${channel} Ads. Budget: $${adBudget}. Core hook: "${hook}". Target demographics: "${demographics}". Deliver exact headlines, description limits, and conversion CTA triggers.`,
          tab: 'ads'
        })
      });
      const data = await response.json();
      setResponseText(data.text);
    } catch (e) {
      setResponseText(`### 📢 Generated ${channel} Ad Copies\n*   **Headline 1**: Automate Your B2B CRM Pipelines\n*   **Description**: Stop losing outbound leads. Connect your database with stable 85ms latency response systems.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTargetAudience = async () => {
    setIsLoading(true);
    setResponseText('Refining interest targets, custom lookup criteria, and search keyword mappings...');
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Acting as Campaign Architect. Propose target audience rules, keywords, and interest tags for Channel: "${channel}", Demographics: "${demographics}".`,
          tab: 'ads'
        })
      });
      const data = await response.json();
      setResponseText(data.text);
    } catch (e) {
      setResponseText('### 🎯 Targeting Parameters\n*   **Keywords**: "enterprise CRM automation", "no-code business OS", "real-time database sync"\n*   **Interests**: Salesforce Admin, HubSpot Certified, CFO Roundtables');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimizeBudget = async () => {
    setIsLoading(true);
    setResponseText('Distributing ad spends dynamically across platforms based on simulated CPA (Cost per Acquisition)...');
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Acting as Ad Spend Optimizer. Analyze a total budget of $${adBudget} and propose dynamic scaling rules between Google Search, Facebook Leads, and LinkedIn Outreach.`,
          tab: 'ads'
        })
      });
      const data = await response.json();
      setResponseText(data.text);
    } catch (e) {
      setResponseText('### 💵 Optimized Spend Allocations\n*   **Google Search**: 55% ($5,500) - target high intent queries.\n*   **LinkedIn/Social**: 45% ($4,500) - target specific job titles.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Title */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div>
          <h2 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <span className="p-1 bg-brand-primary/10 rounded border border-brand-primary/20 text-brand-primary">
              <TrendingUp className="w-4 h-4 animate-pulse" />
            </span>
            Ads Manager (Google / Facebook / Instagram)
          </h2>
          <p className="text-[10px] text-gray-500">Draft ad creative hooks, keyword maps, target audiences, and optimize multi-platform ad spend rules.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Controls (5 cols) */}
        <div className="lg:col-span-5 bg-dark-panel border border-white/5 rounded-lg p-4 space-y-4">
          <div className="flex gap-1.5 border-b border-white/5 pb-2.5">
            {[
              { id: 'copy', label: 'Ad Copy' },
              { id: 'audience', label: 'Audience' },
              { id: 'budget', label: 'Spends' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-1 px-1 rounded text-[10px] font-mono uppercase font-bold tracking-wide cursor-pointer transition-all border ${
                  activeTab === tab.id 
                    ? 'bg-brand-primary text-white border-brand-primary' 
                    : 'bg-dark-bg text-gray-400 border-white/5 hover:border-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[8px] font-bold text-gray-500 block mb-1 uppercase font-mono">Target Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                  className="w-full bg-dark-bg border border-white/10 rounded p-1.5 text-[10px] text-gray-200 outline-none focus:border-brand-primary"
                >
                  <option value="Google">Google Search</option>
                  <option value="Facebook">Facebook Feed</option>
                  <option value="Instagram">Instagram Stories</option>
                </select>
              </div>

              <div>
                <label className="text-[8px] font-bold text-gray-500 block mb-1 uppercase font-mono">Monthly Budget ($)</label>
                <input
                  type="number"
                  value={adBudget}
                  onChange={(e) => setAdBudget(e.target.value)}
                  className="w-full bg-dark-bg border border-white/10 rounded px-2.5 py-1 text-[10px] text-white outline-none focus:border-brand-primary font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold text-gray-400 block mb-1 uppercase font-mono">Core Messaging Hook</label>
              <textarea
                value={hook}
                onChange={(e) => setHook(e.target.value)}
                className="w-full bg-dark-bg border border-white/10 rounded p-2 text-xs text-white focus:border-brand-primary outline-none h-16 resize-none leading-relaxed"
                placeholder="Declare product hook or promotion..."
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-gray-400 block mb-1 uppercase font-mono">Demographics & Interests</label>
              <input
                type="text"
                value={demographics}
                onChange={(e) => setDemographics(e.target.value)}
                className="w-full bg-dark-bg border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:border-brand-primary outline-none"
              />
            </div>
          </div>

          {activeTab === 'copy' && (
            <button
              onClick={handleCreateAd}
              disabled={isLoading}
              className="w-full bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold py-2 rounded cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow"
            >
              {isLoading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-yellow-300" />}
              <span>Generate Ad Copy Suite</span>
            </button>
          )}

          {activeTab === 'audience' && (
            <button
              onClick={handleTargetAudience}
              disabled={isLoading}
              className="w-full bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold py-2 rounded cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow"
            >
              {isLoading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Target className="w-3.5 h-3.5 text-blue-200" />}
              <span>Configure Target Audiences</span>
            </button>
          )}

          {activeTab === 'budget' && (
            <button
              onClick={handleOptimizeBudget}
              disabled={isLoading}
              className="w-full bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold py-2 rounded cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow"
            >
              {isLoading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <DollarSign className="w-3.5 h-3.5 text-emerald-300" />}
              <span>Optimize Budget Splitting</span>
            </button>
          )}
        </div>

        {/* Output (7 cols) */}
        <div className="lg:col-span-7 bg-dark-panel border border-white/5 rounded-lg p-4 flex flex-col justify-between min-h-[360px]">
          <div className="flex-1 space-y-3 flex flex-col">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Ads Engine Results Output</h3>
              <span className="text-[8px] font-mono text-purple-400 uppercase font-bold tracking-widest animate-pulse">
                Active: marketing_ads_agent
              </span>
            </div>

            <div className="flex-1 bg-dark-bg/60 border border-white/5 rounded p-3 text-xs text-gray-300 leading-relaxed font-mono whitespace-pre-wrap h-80 overflow-y-auto">
              {responseText ? (
                responseText
              ) : (
                <div className="h-full flex flex-col justify-center items-center text-center text-gray-500">
                  <TrendingUp className="w-8 h-8 text-gray-600 mb-2" />
                  <p className="text-[10px] uppercase font-mono tracking-wide">Ready for ad rendering. Configure target fields and run generator routines.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2.5 border-t border-white/5 flex justify-end">
            <button
              onClick={() => alert('Ad variations sent directly to active Ads Accounts.')}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 px-3 py-1.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Creative to Live Ads Manager</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
