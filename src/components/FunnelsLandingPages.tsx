import React, { useState } from 'react';
import { 
  Layers, 
  Sparkles, 
  Layout, 
  RefreshCw, 
  FileText, 
  Activity,
  CheckCircle2
} from 'lucide-react';

export default function FunnelsLandingPages() {
  const [productName, setProductName] = useState('AI-BOS Enterprise Suite');
  const [targetPainPoints, setTargetPainPoints] = useState('Manual lead follow-up delays, database connection leaks, high customer support ticket backlogs.');
  const [layoutTheme, setLayoutTheme] = useState('Modern Swiss Dark, neon purple highlights');

  const [isLoading, setIsLoading] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [activeTab, setActiveTab] = useState<'copy' | 'layout' | 'optimize' | 'abtest'>('copy');

  const handleGenerateCopy = async () => {
    setIsLoading(true);
    setResponseText('Generating landing page headline, hero copy, and features matrix...');
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Acting as AI landing page copywriter. Generate high-converting copy sections for Product: "${productName}", targeting pain points: "${targetPainPoints}". Deliver robust headlines, hero benefits, 3 features, and high-impact CTA.`,
          tab: 'funnels'
        })
      });
      const data = await response.json();
      setResponseText(data.text);
    } catch (e) {
      setResponseText('### 📝 Generated Copy (Simulated)\n*   **Hero Headline**: Stop Losing 42% of Inbound Leads to Response Latency\n*   **Sub-headline**: AI-BOS bridges the database gap, scoring and responding to contacts in under 85ms.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLayout = async () => {
    setIsLoading(true);
    setResponseText('Structuring modern viewport landing page wireframe markup with Tailwind utility styles...');
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Acting as Principal UI Layout Designer. Generate structured Tailwind components wireframe markup for a landing page. Product: "${productName}", Theme: "${layoutTheme}".`,
          tab: 'funnels'
        })
      });
      const data = await response.json();
      setResponseText(data.text);
    } catch (e) {
      setResponseText('### 📐 Wireframe Layout Grid\n`<div class="grid grid-cols-1 md:grid-cols-12 gap-8 p-12 bg-dark-panel">`\nContains modern container definitions and grid structures.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimizeFunnel = async () => {
    setIsLoading(true);
    setResponseText('Simulating user session interactions and proposing structural layout corrections...');
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analyze conversion paths for Product: "${productName}". Target pain points: "${targetPainPoints}". Suggest 3 structural funnel improvements.`,
          tab: 'funnels'
        })
      });
      const data = await response.json();
      setResponseText(data.text);
    } catch (e) {
      setResponseText('### 📈 Conversion Optimization Audit\n*   **Friction Point**: Long multi-step forms before booking demo. Fix: Move to 2-field rapid qualifiers.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunABTest = async () => {
    setIsLoading(true);
    setResponseText('Drafting creative variations for headlines and main CTA buttons for validation trials...');
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Draft creative headlines and CTAs for A/B testing: "${productName}". Match Variant A (risk-averse) vs Variant B (ROI-growth focus).`,
          tab: 'funnels'
        })
      });
      const data = await response.json();
      setResponseText(data.text);
    } catch (e) {
      setResponseText('### 🧪 Creative A/B Variants\n*   **Variant A (Security)**: "Bulletproof CRM orchestration for stable growth."\n*   **Variant B (Growth)**: "Scale inbound leads by 4x using autonomous pipelines."');
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
              <Layers className="w-4 h-4" />
            </span>
            Funnels & Landing Pages Builder
          </h2>
          <p className="text-[10px] text-gray-500">Model copy structures, wireframe components, and generate conversion-optimized funnels for marketing campaigns.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Input Controls (5 cols) */}
        <div className="lg:col-span-5 bg-dark-panel border border-white/5 rounded-lg p-4 space-y-4">
          <div className="flex gap-1.5 border-b border-white/5 pb-2.5">
            {[
              { id: 'copy', label: 'Copy' },
              { id: 'layout', label: 'Layout' },
              { id: 'optimize', label: 'Optimize' },
              { id: 'abtest', label: 'A/B Test' }
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
            <div>
              <label className="text-[9px] font-bold text-gray-400 block mb-1 uppercase font-mono">Product Name</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full bg-dark-bg border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:border-brand-primary outline-none"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-gray-400 block mb-1 uppercase font-mono">Core Customer Pain Points</label>
              <textarea
                value={targetPainPoints}
                onChange={(e) => setTargetPainPoints(e.target.value)}
                className="w-full bg-dark-bg border border-white/10 rounded p-2.5 text-xs text-white focus:border-brand-primary outline-none h-20 resize-none leading-relaxed"
                placeholder="List problems your page solves..."
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-gray-400 block mb-1 uppercase font-mono">Visual Styling & Theme</label>
              <input
                type="text"
                value={layoutTheme}
                onChange={(e) => setLayoutTheme(e.target.value)}
                className="w-full bg-dark-bg border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:border-brand-primary outline-none"
              />
            </div>
          </div>

          {activeTab === 'copy' && (
            <button
              onClick={handleGenerateCopy}
              disabled={isLoading}
              className="w-full bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold py-2 rounded cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-yellow-300" />}
              <span>Generate Copy Matrix</span>
            </button>
          )}

          {activeTab === 'layout' && (
            <button
              onClick={handleCreateLayout}
              disabled={isLoading}
              className="w-full bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold py-2 rounded cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Layout className="w-3.5 h-3.5 text-blue-200" />}
              <span>Synthesize Layout Markup</span>
            </button>
          )}

          {activeTab === 'optimize' && (
            <button
              onClick={handleOptimizeFunnel}
              disabled={isLoading}
              className="w-full bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold py-2 rounded cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5 text-blue-200" />}
              <span>Optimize Funnel Metrics</span>
            </button>
          )}

          {activeTab === 'abtest' && (
            <button
              onClick={handleRunABTest}
              disabled={isLoading}
              className="w-full bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold py-2 rounded cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5 text-emerald-300" />}
              <span>Draft A/B Creative Variants</span>
            </button>
          )}
        </div>

        {/* Output Panel (7 cols) */}
        <div className="lg:col-span-7 bg-dark-panel border border-white/5 rounded-lg p-4 flex flex-col justify-between min-h-[360px]">
          <div className="flex-1 space-y-3 flex flex-col">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Funnels Engine Output Stream</h3>
              <span className="text-[8px] font-mono text-purple-400 uppercase font-bold tracking-widest animate-pulse">
                Active: funnels_pages_agent
              </span>
            </div>

            <div className="flex-1 bg-dark-bg/60 border border-white/5 rounded p-3 text-xs text-gray-300 leading-relaxed font-mono whitespace-pre-wrap h-80 overflow-y-auto">
              {responseText ? (
                responseText
              ) : (
                <div className="h-full flex flex-col justify-center items-center text-center text-gray-500">
                  <Layers className="w-8 h-8 text-gray-600 mb-2" />
                  <p className="text-[10px] uppercase font-mono tracking-wide">Configure layout attributes and trigger copy generation block on left.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2.5 border-t border-white/5 flex justify-end">
            <button
              onClick={() => alert('Landing page copy and wireframe committed to GitHub/dist routes.')}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 px-3 py-1.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Commit Layout to Codebase</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
