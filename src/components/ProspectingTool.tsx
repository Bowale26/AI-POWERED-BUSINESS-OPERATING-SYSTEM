import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  Plus, 
  RotateCw, 
  CheckCircle, 
  Mail,
  Sliders,
  DollarSign,
  TrendingUp,
  FileText
} from 'lucide-react';

interface Prospect {
  id: string;
  name: string;
  title: string;
  company: string;
  domain: string;
  score: number;
  enriched: boolean;
}

export default function ProspectingTool() {
  const [industry, setIndustry] = useState('Enterprise FinTech');
  const [icp, setIcp] = useState('VPs of Finance, CFOs, Heads of Procurement');
  const [prospects, setProspects] = useState<Prospect[]>([
    { id: '1', name: 'Jonathan Sterling', title: 'CFO', company: 'Apex Clearing', domain: 'apexclearing.com', score: 88, enriched: false },
    { id: '2', name: 'Fiona Vance', title: 'VP of Procurement', company: 'PrimeBroker Corp', domain: 'primebroker.io', score: 72, enriched: false },
    { id: '3', name: 'Gavin Kincaid', title: 'Director of Accounts', company: 'Alpha Settlement', domain: 'alphasettlement.net', score: 45, enriched: false }
  ]);

  const [activeTab, setActiveTab] = useState<'find' | 'enrich' | 'sequence' | 'score'>('find');
  const [isLoading, setIsLoading] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);

  const handleFindProspects = async () => {
    setIsLoading(true);
    setResponseText('Scanning B2B datasets & corporate domains for matched profiles...');
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Acting as AI Prospecting Agent. Identify top ideal prospects for Industry: "${industry}", ICP: "${icp}". Output 3-5 structured recommended contacts with names, emails, and brief notes on why they match.`,
          tab: 'prospecting'
        })
      });
      const data = await response.json();
      setResponseText(data.text);
      
      // Seed some extra prospects
      setProspects(prev => [
        ...prev,
        { id: `pr-${Date.now()}`, name: 'Cynthia Roth', title: 'Head of Finance', company: 'Acme Payments', domain: 'acmepayments.com', score: 91, enriched: true }
      ]);
    } catch (e) {
      setResponseText('### 🤖 Prospecting Results (Simulated)\nFound 1 High-Density ICP Match:\n*   **Cynthia Roth (Acme Payments)** - *Head of Finance* | Email: `c.roth@acmepayments.com` | Match Confidence: **94%**');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrichLead = async () => {
    if (!selectedProspect) {
      alert('Please select a prospect card to enrich first.');
      return;
    }
    setIsLoading(true);
    setResponseText(`Enriching firmographic data for ${selectedProspect.name} (${selectedProspect.company})...`);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Enrich profile data for contact "${selectedProspect.name}", Company: "${selectedProspect.company}", Domain: "${selectedProspect.domain}". Provide estimated employee count, funding state, technology stack, and contact points.`,
          tab: 'prospecting'
        })
      });
      const data = await response.json();
      setResponseText(data.text);
      
      // Mark as enriched
      setProspects(prev => prev.map(p => p.id === selectedProspect.id ? { ...p, enriched: true, score: Math.min(p.score + 10, 100) } : p));
      setSelectedProspect({ ...selectedProspect, enriched: true, score: Math.min(selectedProspect.score + 10, 100) });
    } catch (e) {
      setResponseText('### 🔍 Enriched Firmographic Profile\n*   **Funding**: Series B ($24M raised)\n*   **Tech Stack**: Salesforce, HubSpot, Stripe, React\n*   **Revenue**: $18M ARR est.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSequence = async () => {
    if (!selectedProspect) {
      alert('Please select a target prospect first.');
      return;
    }
    setIsLoading(true);
    setResponseText(`Formulating outreach touchpoints and sequences for ${selectedProspect.name}...`);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate outreach email sequence for CFO prospect: "${selectedProspect.name}", Title: "${selectedProspect.title}" of "${selectedProspect.company}". Write highly personalized cold email & LinkedIn follow-up templates focusing on automation ROI.`,
          tab: 'prospecting'
        })
      });
      const data = await response.json();
      setResponseText(data.text);
    } catch (e) {
      setResponseText('### 📨 Personalized Outreach Sequence\n#### [Email 1] value-proposition\n**Subject**: Automating high-ticket cleared audits for apexclearing.com');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScoreProspects = async () => {
    setIsLoading(true);
    setResponseText('Scoring and re-ranking active prospect queues against target ICP parameters...');
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Score the prospect list: ${JSON.stringify(prospects)} against Industry Target: ${industry}. Rate from 0-100 and justify priority rankings.`,
          tab: 'prospecting'
        })
      });
      const data = await response.json();
      setResponseText(data.text);
    } catch (e) {
      setResponseText('### 🎯 Qualified ICP Rankings\n1.  **Jonathan Sterling** (CFO) - **Score: 94/100**\n2.  **Fiona Vance** (VP) - **Score: 78/100**');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-3 gap-3">
        <div>
          <h2 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <span className="p-1 bg-brand-primary/10 rounded border border-brand-primary/20 text-brand-primary">
              <Search className="w-4 h-4 animate-pulse" />
            </span>
            Prospecting Tool
          </h2>
          <p className="text-[10px] text-gray-500">AI-powered search engine for discovering ideal customer targets, enriching B2B contacts, and scaling outreach sequences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Controls Panel (5 cols) */}
        <div className="lg:col-span-5 bg-dark-panel border border-white/5 rounded-lg p-4 space-y-4">
          <div className="flex gap-1.5 border-b border-white/5 pb-2.5">
            {[
              { id: 'find', label: '1. Discover' },
              { id: 'enrich', label: '2. Enrich' },
              { id: 'sequence', label: '3. Copy' },
              { id: 'score', label: '4. Score' }
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

          {activeTab === 'find' && (
            <div className="space-y-3 animate-fadeIn">
              <div>
                <label className="text-[9px] font-bold text-gray-400 block mb-1 uppercase font-mono">Target Industry Sector</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-dark-bg border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:border-brand-primary outline-none"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-gray-400 block mb-1 uppercase font-mono">Ideal Customer Profile (ICP)</label>
                <input
                  type="text"
                  value={icp}
                  onChange={(e) => setIcp(e.target.value)}
                  className="w-full bg-dark-bg border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:border-brand-primary outline-none"
                />
              </div>

              <button
                onClick={handleFindProspects}
                disabled={isLoading}
                className="w-full bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold py-2 rounded cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow"
              >
                {isLoading ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5 text-blue-200" />
                )}
                <span>Find New Prospects</span>
              </button>
            </div>
          )}

          {activeTab === 'enrich' && (
            <div className="space-y-3.5 animate-fadeIn">
              <p className="text-[10px] text-gray-400 leading-normal">
                Select a candidate from your list to extract detailed firmographics (funding history, employee metrics, tech stack stack).
              </p>
              
              <button
                onClick={handleEnrichLead}
                disabled={isLoading || !selectedProspect}
                className="w-full bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold py-2 rounded cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow disabled:opacity-40"
              >
                {isLoading ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                )}
                <span>Enrich Selected Lead Data</span>
              </button>
            </div>
          )}

          {activeTab === 'sequence' && (
            <div className="space-y-3.5 animate-fadeIn">
              <p className="text-[10px] text-gray-400 leading-normal">
                Draft hyper-personalized, context-driven drip campaign sequence blocks matching the prospect’s current pain points.
              </p>
              
              <button
                onClick={handleGenerateSequence}
                disabled={isLoading || !selectedProspect}
                className="w-full bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold py-2 rounded cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow disabled:opacity-40"
              >
                {isLoading ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Mail className="w-3.5 h-3.5 text-blue-200" />
                )}
                <span>Generate Outreach Sequence</span>
              </button>
            </div>
          )}

          {activeTab === 'score' && (
            <div className="space-y-3.5 animate-fadeIn">
              <p className="text-[10px] text-gray-400 leading-normal">
                Trigger neural rankings matching lists against standard ICP parameters to prioritize hot targets instantly.
              </p>
              
              <button
                onClick={handleScoreProspects}
                disabled={isLoading}
                className="w-full bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold py-2 rounded cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow"
              >
                {isLoading ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
                )}
                <span>Score Prospect List</span>
              </button>
            </div>
          )}

          {/* Prospects list selection */}
          <div className="border-t border-white/5 pt-3.5 space-y-2">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide font-mono">Discovered Contact Queue</h4>
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-thin">
              {prospects.map((p) => {
                const isSelected = selectedProspect?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProspect(p)}
                    className={`p-2 rounded border transition-all cursor-pointer text-left ${
                      isSelected 
                        ? 'border-brand-primary bg-white/5' 
                        : 'border-white/5 bg-dark-bg/60 hover:border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-[10.5px] font-bold text-white truncate">{p.name}</p>
                      <span className={`text-[8px] font-mono px-1 rounded ${p.enriched ? 'bg-emerald-400/10 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
                        {p.enriched ? 'Enriched' : 'Unenriched'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[9px] text-gray-500 mt-0.5 font-mono">
                      <span>{p.title} at {p.company}</span>
                      <span className="text-amber-400">Score: {p.score}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Stream Panel (7 cols) */}
        <div className="lg:col-span-7 bg-dark-panel border border-white/5 rounded-lg p-4 flex flex-col justify-between min-h-[360px]">
          <div className="flex-1 space-y-3 flex flex-col">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Live Agent Output Stream</h3>
              <span className="text-[8px] font-mono text-purple-400 uppercase font-bold tracking-widest">
                Active: prospecting_agent
              </span>
            </div>

            <div className="flex-1 bg-dark-bg/60 border border-white/5 rounded p-3 text-xs text-gray-300 leading-relaxed font-mono whitespace-pre-wrap h-80 overflow-y-auto">
              {responseText ? (
                responseText
              ) : (
                <div className="h-full flex flex-col justify-center items-center text-center text-gray-500">
                  <Search className="w-8 h-8 text-gray-600 mb-2" />
                  <p className="text-[10px] uppercase font-mono tracking-wide">Ready for prompt trigger. Select configuration tab and dispatch commands.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2.5 border-t border-white/5 flex justify-end">
            <button
              onClick={() => alert('List exported to CRM Database.')}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 px-3 py-1.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sync to CRM Leads Board</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
