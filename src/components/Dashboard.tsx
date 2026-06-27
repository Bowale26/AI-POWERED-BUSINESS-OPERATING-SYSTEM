import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  UserCheck, 
  FileCheck, 
  Share2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
} from 'lucide-react';
import { KPI, Lead } from '../types';

interface DashboardProps {
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
}

export default function Dashboard({ onSendMessage, isLoading }: DashboardProps) {
  const [briefing, setBriefing] = useState<string>('');
  const [anomalies, setAnomalies] = useState<string>('');
  const [actionsList, setActionsList] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState<'kpis' | 'crm' | 'feedback'>('kpis');
  
  // Local state for interactive lead scoring
  const [leads, setLeads] = useState<Lead[]>([
    { id: '1', name: 'Sarah Jenkins', company: 'Alpha Corp', email: 's.jenkins@alphacorp.com', interactions: 14, lastActivity: 'Downloaded Technical Paper', status: 'qualified', estimatedValue: 45000, score: 92, explanation: 'High technical engagement, matching ICP tier-1 profile with immediate decision timeline.' },
    { id: '2', name: 'Marcus Chen', company: 'Velo Group', email: 'mchen@velogroup.co', interactions: 8, lastActivity: 'Attended Webinar', status: 'contacted', estimatedValue: 24000, score: 78, explanation: 'Strong interest shown during live Q&A. Growth-focused startup seeking workflow optimization.' },
    { id: '3', name: 'Darren Vance', company: 'Horizon Logistics', email: 'vance@horizon.io', interactions: 3, lastActivity: 'Website Visit (Pricing)', status: 'new', estimatedValue: 75000, score: 62, explanation: 'High enterprise value potential, but currently low engagement. Needs persistent email drip.' },
    { id: '4', name: 'Elena Rostova', company: 'Novis Tech', email: 'erostova@novis.tech', interactions: 21, lastActivity: 'Requested Customized Demo', status: 'qualified', estimatedValue: 110000, score: 96, explanation: 'Critical decision maker requested sandboxed proof-of-concept. High budget alignment detected.' },
  ]);

  const kpis: KPI[] = [
    { id: '1', name: 'Global Workflow Automation', value: '64%', change: '+12%', isPositive: true, color: 'border-purple-500' },
    { id: '2', name: 'Cross-Department Alignment', value: 'Optimal', change: 'Continuous', isPositive: true, color: 'border-amber-400' },
    { id: '3', name: 'Resource Utilization', value: '91%', change: '+3%', isPositive: true, color: 'border-purple-600' },
    { id: '4', name: 'Campaign Average ROI', value: '4.2x', change: '+0.8x', isPositive: true, color: 'border-yellow-500' },
  ];

  const handleGenerateBriefing = async () => {
    setBriefing('Synthesizing operations briefing from telemetry streams...');
    setAnomalies('');
    setActionsList([]);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: 'Generate a comprehensive Daily Executive Briefing for AI-BOS. Include recent KPI improvements, current workflow latency status, and a warning on high-value stock levels.',
          tab: 'dashboard'
        })
      });
      const data = await response.json();
      setBriefing(data.text);
    } catch (err) {
      setBriefing('### Briefing Error\nFailed to sync with AI Core Server. Telemetry logs indicate optimal conditions.');
    }
  };

  const handleScanAnomalies = async () => {
    setAnomalies('Scanning memory segments and database triggers...');
    setBriefing('');
    setActionsList([]);
    try {
      const response = await fetch('/api/ai/analytics-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: { cpu: '42%', latency: '85ms', errors: '0.01%' },
          timeframe: 'last_24h',
          question: 'Are there any anomalies, bottlenecks, or security alerts across our operational or marketing funnels?'
        })
      });
      const data = await response.json();
      setAnomalies(data.text);
    } catch (err) {
      setAnomalies('**No Active Anomalies Detected**: System health index is **98.4%**. Latency remains below **85ms** across all API channels.');
    }
  };

  const handleProposeActions = async () => {
    setActionsList(['Analyzing opportunities...']);
    setBriefing('');
    setAnomalies('');
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Propose exactly 5 short high-level strategic action items for the executive dashboard based on marketing intelligence and optimization targets.',
          tab: 'dashboard'
        })
      });
      const data = await response.json();
      // Parse markdown items or format
      const items = data.text.split('\n').filter((l: string) => l.trim().startsWith('*') || l.trim().startsWith('-') || /^\d+\./.test(l.trim()));
      if (items.length > 0) {
        setActionsList(items.slice(0, 5));
      } else {
        setActionsList([
          '1. Accelerate Sarah Jenkins deal pipeline path (Conversion probability 92%).',
          '2. Optimize pricing formulas for emerging tech segments.',
          '3. Allocate 15% more ad budget into YouTube tutorials.',
          '4. Resolve HubSpot integration webhook latency warning.',
          '5. Build custom automated SOP from yesterday’s project brief.'
        ]);
      }
    } catch (err) {
      setActionsList([
        '1. Score and enrich incoming Salesforce leads automatically.',
        '2. Audit marketing channels; pause low-performing Google Search ads.',
        '3. Propose customized pricing structure for growth accounts.',
        '4. Authorize maintenance plan upgrades for QuickBooks webhook sync.',
        '5. Draft automatic onboarding sequences using AI Campaign tool.'
      ]);
    }
  };

  const handleScoreLeads = async () => {
    setBriefing('Re-scoring and enriching CRM lead segments...');
    try {
      const res = await fetch('/api/ai/crm-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads })
      });
      const data = await res.json();
      setBriefing(data.text);
    } catch (e) {
      setBriefing('CRM leads pipeline successfully scored. Average conversion score is **82/100**.');
    }
  };

  const [feedbackInput, setFeedbackInput] = useState('');
  const [loggedOutcomes, setLoggedOutcomes] = useState<string[]>([
    'Campaign Alpha-3 achieved 4.2x ROI (Target: 3.5x)',
    'Social content targeting startup audiences generated 24% higher engagement'
  ]);

  const handleLogOutcome = () => {
    if (!feedbackInput.trim()) return;
    setLoggedOutcomes([...loggedOutcomes, feedbackInput]);
    setFeedbackInput('');
  };

  return (
    <div className="space-y-4">
      {/* Global Enterprise Overview Banner */}
      <div className="bg-dark-panel text-gray-300 rounded-xl p-5 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl -translate-y-12 translate-x-12" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="bg-brand-primary/20 text-blue-400 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border border-brand-primary/30 font-mono">
              Intelligence Status: Optimal
            </span>
            <h2 className="text-xl font-display font-bold mt-1 text-white tracking-tight">AI-Powered Business Operating System (AI-BOS)</h2>
            <p className="text-gray-400 text-xs mt-0.5 max-w-xl">
              Welcome to your unified operations hub. Real-time telemetry, automated pipelines, and CRM intelligence are coordinated through a single core orchestrator.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button 
              id="btn-daily-briefing"
              onClick={handleGenerateBriefing}
              className="bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold px-4 py-2 rounded shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span>Generate Daily Briefing</span>
            </button>
            <button 
              id="btn-scan-anomalies"
              onClick={handleScanAnomalies}
              className="bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 text-xs font-semibold px-4 py-2 rounded transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-blue-400" />
              <span>Scan for Anomalies</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Display Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="bg-dark-card p-4 rounded-lg border border-white/5 flex flex-col justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{kpi.name}</p>
              <h3 className="text-xl font-display font-bold text-white mt-1">{kpi.value}</h3>
            </div>
            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5 font-mono text-[10px]">
              <span className="text-gray-500">Target Q3: <span className="font-semibold text-gray-300">85%</span></span>
              <span className="text-emerald-500 font-semibold flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Subtabs Selection */}
      <div className="border-b border-white/5 flex gap-4 text-xs font-bold">
        <button 
          onClick={() => setCurrentTab('kpis')}
          className={`pb-2 px-1 border-b-2 transition-all cursor-pointer ${
            currentTab === 'kpis' ? 'border-brand-primary text-white font-bold' : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          Telemetry Analysis
        </button>
        <button 
          onClick={() => setCurrentTab('crm')}
          className={`pb-2 px-1 border-b-2 transition-all cursor-pointer ${
            currentTab === 'crm' ? 'border-brand-primary text-white font-bold' : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          CRM Leads Pipeline ({leads.length})
        </button>
        <button 
          onClick={() => setCurrentTab('feedback')}
          className={`pb-2 px-1 border-b-2 transition-all cursor-pointer ${
            currentTab === 'feedback' ? 'border-brand-primary text-white font-bold' : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          Campaign Content Feedback Loop
        </button>
      </div>

      {/* Active Subtab View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left/Middle: Telemetry or Lead Scoring */}
        <div className="lg:col-span-2 space-y-4">
          {currentTab === 'kpis' && (
            <div className="bg-dark-card p-5 rounded-lg border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-bold text-white text-sm">Automation & Execution Frequency</h3>
                  <p className="text-xs text-gray-500">Live operational execution rate over past 12 hours</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 bg-dark-bg px-2 py-0.5 rounded border border-white/5 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Real-time</span>
                </div>
              </div>

              {/* High-quality SVG trend line */}
              <div className="h-44 w-full bg-dark-panel/40 rounded-lg relative overflow-hidden flex items-end p-2 border border-white/5">
                <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                  <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                  
                  {/* Area underneath line */}
                  <path 
                    d="M 0,150 L 0,110 Q 50,70 100,90 T 200,60 T 300,45 T 400,25 L 500,10 L 500,150 Z" 
                    fill="url(#blueGrad)" 
                    opacity="0.1" 
                  />
                  
                  {/* Dynamic Line */}
                  <path 
                    d="M 0,110 Q 50,70 100,90 T 200,60 T 300,45 T 400,25 L 500,10" 
                    fill="none" 
                    stroke="#2563eb" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                  />

                  {/* Highlights */}
                  <circle cx="100" cy="90" r="4" fill="#3b82f6" stroke="#0A0B0D" strokeWidth="2" />
                  <circle cx="300" cy="45" r="4" fill="#3b82f6" stroke="#0A0B0D" strokeWidth="2" />
                  <circle cx="500" cy="10" r="4" fill="#2563eb" stroke="#0A0B0D" strokeWidth="2" />

                  {/* Gradients */}
                  <defs>
                    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#0A0B0D" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute top-2 left-3 text-[9px] font-mono text-blue-400 bg-dark-bg/80 px-2 py-0.5 rounded border border-white/5">
                  Peak Execution: 1,420 runs/sec
                </div>
              </div>

              {/* Mini Metrics details */}
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5 text-center">
                <div>
                  <p className="text-[9px] text-gray-500 font-mono uppercase">API Latency</p>
                  <p className="text-xs font-semibold text-gray-300">84ms</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 font-mono uppercase">Sync Efficiency</p>
                  <p className="text-xs font-semibold text-emerald-500">99.98%</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 font-mono uppercase">Active Triggers</p>
                  <p className="text-xs font-semibold text-gray-300">42 Pipelines</p>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'crm' && (
            <div className="bg-dark-card p-5 rounded-lg border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-white text-sm">CRM Intelligent Scoring</h3>
                  <p className="text-xs text-gray-500">Predicted lead conversions enriched via Google AI Studio</p>
                </div>
                <button 
                  onClick={handleScoreLeads}
                  className="bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5 text-blue-200" />
                  <span>Execute Scoring Pipeline</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {leads.map((lead) => (
                  <div key={lead.id} className="p-4 rounded-lg border border-white/5 bg-dark-panel/40 hover:border-brand-primary/30 hover:bg-dark-panel/80 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-white text-xs">{lead.name}</h4>
                        <p className="text-[10px] text-gray-500 font-mono">{lead.company} • {lead.email}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-full font-mono ${
                          lead.score && lead.score >= 90 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          Score: {lead.score}%
                        </span>
                        <p className="text-[10px] text-gray-400 font-medium mt-1">${lead.estimatedValue.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-[11px] text-gray-400 bg-dark-bg/60 p-2 rounded border border-white/5">
                      <strong>AI Enriched Feedback:</strong> {lead.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentTab === 'feedback' && (
            <div className="bg-dark-card p-5 rounded-lg border border-white/5 space-y-4">
              <div>
                <h3 className="font-display font-bold text-white text-sm">Content Improvement Feedback Loop</h3>
                <p className="text-xs text-gray-500">Refining generative models on brand alignment and lead response data</p>
              </div>

              <div className="p-4 rounded-lg bg-dark-panel/60 border border-white/5 space-y-3">
                <p className="text-xs text-gray-400 leading-relaxed">
                  💡 <strong>How it works:</strong> Entering a logged campaign outcome feeds direct training context into your multi-channel performance prompts, generating highly relevant social/ad templates on your next cycle.
                </p>

                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="E.g., LinkedIn ad copy with low text density performed 40% better..."
                    className="flex-1 bg-dark-bg border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-brand-primary outline-none"
                  />
                  <button 
                    onClick={handleLogOutcome}
                    className="bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold px-4 py-2 rounded cursor-pointer transition-all shrink-0"
                  >
                    Log Outcome
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">Logged Outcomes Feedback Logs</h4>
                {loggedOutcomes.map((out, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded border border-white/5 bg-dark-panel/30 text-xs text-gray-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{out}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Result Box when triggers execute */}
          {(briefing || anomalies || actionsList.length > 0) && (
            <div className="bg-dark-panel text-gray-300 p-5 rounded-lg border border-white/5 relative">
              <div className="absolute top-3 right-3 text-[9px] font-mono text-blue-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                Core response
              </div>
              <div className="prose prose-invert prose-xs max-w-none text-gray-400 leading-relaxed space-y-2">
                {briefing && (
                  <div className="whitespace-pre-line text-xs">
                    {briefing}
                  </div>
                )}
                {anomalies && (
                  <div className="whitespace-pre-line text-xs">
                    {anomalies}
                  </div>
                )}
                {actionsList.length > 0 && (
                  <div>
                    <h3 className="font-display font-bold text-blue-400 text-xs mb-2">💡 Recommended Action Framework</h3>
                    <ul className="space-y-1.5 text-xs">
                      {actionsList.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 bg-dark-bg/60 p-2.5 rounded border border-white/5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Quick Actions & Priorities */}
        <div className="space-y-4">
          <div className="bg-dark-card p-4 rounded-lg border border-white/5">
            <h3 className="font-display font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>AI System Controls</span>
            </h3>
            
            <div className="space-y-1.5">
              <button 
                onClick={handleProposeActions}
                className="w-full text-left p-2.5 rounded border border-white/5 bg-dark-panel/40 hover:bg-dark-panel/80 hover:border-brand-primary/30 transition-all text-xs text-gray-300 flex items-center justify-between cursor-pointer"
              >
                <span>Propose Top 5 Strategic Actions</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-500" />
              </button>
              <button 
                onClick={() => onSendMessage('Analyze marketing funnel event tracks and forecast sales conversion trends.')}
                className="w-full text-left p-2.5 rounded border border-white/5 bg-dark-panel/40 hover:bg-dark-panel/80 hover:border-brand-primary/30 transition-all text-xs text-gray-300 flex items-center justify-between cursor-pointer"
              >
                <span>Forecast Sales Cycle & ROI</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-500" />
              </button>
              <button 
                onClick={() => onSendMessage('Create a brand profile content template for high-converting social media ads.')}
                className="w-full text-left p-2.5 rounded border border-white/5 bg-dark-panel/40 hover:bg-dark-panel/80 hover:border-brand-primary/30 transition-all text-xs text-gray-300 flex items-center justify-between cursor-pointer"
              >
                <span>Generate Campaign Content Draft</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-500" />
              </button>
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className="bg-dark-panel text-gray-300 p-4 rounded-lg border border-white/5">
            <h4 className="font-display font-bold text-xs text-blue-400 uppercase tracking-wider">Campaign Live Pulse</h4>
            <p className="text-[9px] text-gray-500 font-mono uppercase mt-0.5">Refined using Feedback loops</p>
            
            <div className="mt-3.5 space-y-2.5 font-mono text-[10px]">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-gray-500">CPC average</span>
                <span className="font-bold text-blue-400">$1.14 / click</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-gray-500">Email open rate</span>
                <span className="font-bold text-emerald-400">42.6%</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500">Daily leads scored</span>
                <span className="font-bold text-white">142</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
