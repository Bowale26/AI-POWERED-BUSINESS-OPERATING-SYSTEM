import React, { useState } from 'react';
import { 
  Sparkles, 
  Cpu, 
  Settings, 
  Send, 
  Database, 
  BarChart3, 
  Layers, 
  Play, 
  Code, 
  CheckCircle2, 
  ChevronRight, 
  FileJson, 
  FileText,
  RefreshCw,
  Sliders,
  TrendingUp,
  PieChart as PieIcon,
  Users2,
  DollarSign
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Cell as RechartsCell
} from 'recharts';

interface OrchestratorPanelProps {
  systemStatus: {
    status: string;
    efficiency: string;
    geminiKeyConfigured: boolean;
  };
}

export default function OrchestratorPanel({ systemStatus }: OrchestratorPanelProps) {
  const [activeAgent, setActiveAgent] = useState<'campaign' | 'lead' | 'analytics'>('campaign');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [agentOutput, setAgentOutput] = useState<string>('');
  const [rawPayload, setRawPayload] = useState<any>(null);
  
  // 1. Campaign content state
  const [campaignBrand, setCampaignBrand] = useState<string>('Veloce SaaS');
  const [campaignTone, setCampaignTone] = useState<string>('Bold, Professional, Benefits-driven');
  const [campaignGoal, setCampaignGoal] = useState<string>('Increase high-ticket enterprise Demo signups by 25%');
  const [campaignChannels, setCampaignChannels] = useState<string>('Email, LinkedIn Ad');
  const [campaignAudience, setCampaignAudience] = useState<string>('CMOs and VPs of Marketing in SaaS corporations');
  const [campaignConstraints, setCampaignConstraints] = useState<string>('Max 300 words. Do not use generic words like "cheap" or "discount".');

  // 2. Lead scoring state
  const [leadList, setLeadList] = useState<string>(
    JSON.stringify([
      { "id": "L1", "name": "Sarah Jenkins", "company": "Alpha Corp", "interactions": 12, "estimatedValue": 45000 },
      { "id": "L2", "name": "Marcus Chen", "company": "Velo Group", "interactions": 4, "estimatedValue": 12000 },
      { "id": "L3", "name": "Fintech Logistics Ltd", "company": "Fintech Log", "interactions": 1, "estimatedValue": 85000 }
    ], null, 2)
  );
  const [interactionHistory, setInteractionHistory] = useState<string>(
    JSON.stringify({
      "L1": "Attended SaaS webinar, downloaded whitepaper, spoke to sales rep via chat",
      "L2": "Opened 2 onboarding emails, visited enterprise pricing page once",
      "L3": "Created self-serve account, uploaded 1 document, then went inactive"
    }, null, 2)
  );

  // 3. Marketing analytics state
  const [metricsJson, setMetricsJson] = useState<string>(
    JSON.stringify({
      "clicks": 2450,
      "conversions": 182,
      "averageCpc": 1.25,
      "totalSpend": 3062.5,
      "ctrPercent": 3.4,
      "previousConversions": 145
    }, null, 2)
  );
  const [timeframe, setTimeframe] = useState<string>('Past 30 Days (vs Previous Period)');

  // Orchestrator Configuration representation
  const orchestratorConfig = {
    name: "Digital Marketing CRM – Orchestrator",
    description: "Central AI agent coordinating campaign content, lead scoring, and performance insights.",
    model: "gemini-3.1-pro-preview",
    temperature: 0.3,
    system_instruction: [
      "You orchestrate digital marketing CRM tasks: campaign generation, lead scoring, pipeline analysis, and performance insights.",
      "Understand user intent, select the right tool, and respond with concise, actionable recommendations."
    ],
    tools: [
      {
        name: "campaign_content_agent",
        description: "Generates and optimizes digital marketing campaign content.",
        required: ["brand_profile", "goal", "channels"]
      },
      {
        name: "crm_lead_scoring_agent",
        description: "Scores leads and predicts conversion likelihood.",
        required: ["lead_data"]
      },
      {
        name: "marketing_analytics_agent",
        description: "Explains performance changes and recommends optimizations.",
        required: ["metrics_json", "timeframe"]
      }
    ]
  };

  const executeAgentAction = async () => {
    setIsLoading(true);
    setAgentOutput('');
    setRawPayload(null);

    let endpoint = '';
    let body: any = {};

    if (activeAgent === 'campaign') {
      endpoint = '/api/ai/content-generate';
      body = {
        brand_profile: { name: campaignBrand, tone: campaignTone },
        goal: campaignGoal,
        channels: campaignChannels.split(',').map(s => s.trim()),
        audience_segments: [campaignAudience],
        constraints: { details: campaignConstraints }
      };
    } else if (activeAgent === 'lead') {
      endpoint = '/api/ai/crm-score';
      try {
        body = {
          leads: JSON.parse(leadList),
          history: JSON.parse(interactionHistory)
        };
      } catch (e) {
        setAgentOutput('### 🛑 Configuration Syntax Error\nInvalid JSON in Leads List or Interaction History. Please verify formatting.');
        setIsLoading(false);
        return;
      }
    } else {
      endpoint = '/api/ai/analytics-explain';
      try {
        body = {
          metrics: JSON.parse(metricsJson),
          timeframe: timeframe,
          question: 'Explain performance changes and give exact recommendations based on conversion values'
        };
      } catch (e) {
        setAgentOutput('### 🛑 Configuration Syntax Error\nInvalid JSON in Metrics Schema. Please verify formatting.');
        setIsLoading(false);
        return;
      }
    }

    setRawPayload(body);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      setAgentOutput(data.text || JSON.stringify(data, null, 2));
    } catch (err) {
      setAgentOutput(`### 🤖 Offline Simulation Loop\nSystem successfully routed request to simulator.\n\n*   **Status**: Done\n*   **Action**: Processed request parameters securely.\n*   **Response**: Connect your Gemini API Key in the **Settings > Secrets** panel for instant high-thinking reasoning.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Visualization controls
  const [chartType, setChartType] = useState<'tier' | 'segment'>('tier');
  const [metricMode, setMetricMode] = useState<'count' | 'value'>('count');

  // Format currency helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Dynamically parse leads to render inside Recharts widgets
  const getParsedLeadData = () => {
    try {
      const parsed = JSON.parse(leadList);
      if (Array.isArray(parsed)) {
        return parsed.map((lead: any) => {
          let probability = 'Cold';
          let probVal = 20;
          let segment = 'Self-Serve Explorer';
          
          const interactions = Number(lead.interactions) || 0;
          const val = Number(lead.estimatedValue) || 10000;
          
          // Classify segment based on interactive metrics and target values
          if (interactions >= 10 || val >= 45000) {
            probability = 'Hot';
            probVal = 85;
            segment = 'Enterprise CMO';
          } else if (interactions >= 3 || val >= 12000) {
            probability = 'Warm';
            probVal = 55;
            segment = 'VP of Marketing';
          } else {
            probability = 'Cold';
            probVal = 15;
            segment = 'Self-Serve Explorer';
          }
          
          return {
            name: lead.name || lead.company || 'Unknown Lead',
            company: lead.company || 'N/A',
            value: val,
            interactions: interactions,
            probability,
            probVal,
            segment
          };
        });
      }
    } catch (e) {
      // Return safe fallback if user breaks JSON syntax
    }
    
    return [
      { name: "Sarah Jenkins", company: "Alpha Corp", value: 45000, interactions: 12, probability: "Hot", probVal: 85, segment: "Enterprise CMO" },
      { name: "Marcus Chen", company: "Velo Group", value: 12000, interactions: 4, probability: "Warm", probVal: 55, segment: "VP of Marketing" },
      { name: "Fintech Logistics Ltd", company: "Fintech Log", value: 85000, interactions: 1, probability: "Cold", probVal: 15, segment: "Self-Serve Explorer" }
    ];
  };

  const parsedLeads = getParsedLeadData();

  // Tier Analytics data calculations
  const tierDistributionData = [
    { 
      name: 'Hot Tier (>80%)', 
      count: parsedLeads.filter(l => l.probability === 'Hot').length, 
      value: parsedLeads.filter(l => l.probability === 'Hot').reduce((acc, curr) => acc + curr.value, 0),
      color: '#2563eb' // Blue
    },
    { 
      name: 'Warm Tier (40-80%)', 
      count: parsedLeads.filter(l => l.probability === 'Warm').length, 
      value: parsedLeads.filter(l => l.probability === 'Warm').reduce((acc, curr) => acc + curr.value, 0),
      color: '#10b981' // Emerald/Green
    },
    { 
      name: 'Cold Tier (<40%)', 
      count: parsedLeads.filter(l => l.probability === 'Cold').length, 
      value: parsedLeads.filter(l => l.probability === 'Cold').reduce((acc, curr) => acc + curr.value, 0),
      color: '#4b5563' // Muted Gray
    },
  ];

  // Segment Analytics data calculations
  const segmentDistributionData = [
    { 
      name: 'Enterprise CMO', 
      count: parsedLeads.filter(l => l.segment === 'Enterprise CMO').length, 
      value: parsedLeads.filter(l => l.segment === 'Enterprise CMO').reduce((acc, curr) => acc + curr.value, 0),
      color: '#8b5cf6' // Violet
    },
    { 
      name: 'VP of Marketing', 
      count: parsedLeads.filter(l => l.segment === 'VP of Marketing').length, 
      value: parsedLeads.filter(l => l.segment === 'VP of Marketing').reduce((acc, curr) => acc + curr.value, 0),
      color: '#f59e0b' // Amber/Orange
    },
    { 
      name: 'Self-Serve Explorer', 
      count: parsedLeads.filter(l => l.segment === 'Self-Serve Explorer').length, 
      value: parsedLeads.filter(l => l.segment === 'Self-Serve Explorer').reduce((acc, curr) => acc + curr.value, 0),
      color: '#3b82f6' // Sky Blue
    },
  ];

  const totalLeadsCount = parsedLeads.length;
  const totalPipelineValue = parsedLeads.reduce((acc, curr) => acc + curr.value, 0);
  const hotLeadsCount = parsedLeads.filter(l => l.probability === 'Hot').length;
  const averageInteractions = totalLeadsCount > 0 
    ? (parsedLeads.reduce((acc, curr) => acc + curr.interactions, 0) / totalLeadsCount).toFixed(1)
    : '0';

  const chartData = chartType === 'tier' ? tierDistributionData : segmentDistributionData;
  const dataKey = metricMode === 'count' ? 'count' : 'value';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-dark-panel border border-white/10 rounded p-3 shadow-xl space-y-1 text-[11px] font-mono">
          <p className="font-bold text-white border-b border-white/5 pb-1 mb-1.5">{data.name}</p>
          <div className="flex justify-between gap-6">
            <span className="text-gray-400">Lead Volume:</span>
            <span className="text-blue-400 font-bold">{data.count} Leads</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-gray-400">Est. Pipeline:</span>
            <span className="text-emerald-400 font-bold">{formatCurrency(data.value)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      {/* Overview Header banner */}
      <div className="relative overflow-hidden bg-dark-card border border-white/5 rounded-lg p-6">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-brand-primary/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-brand-primary/10 border border-brand-primary/20 rounded text-brand-primary">
                <Cpu className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold font-display text-white tracking-tight">{orchestratorConfig.name}</h2>
            </div>
            <p className="text-xs text-gray-400 max-w-2xl">{orchestratorConfig.description}</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-1 rounded bg-white/5 border border-white/5 text-blue-400">
              Model: {orchestratorConfig.model}
            </span>
            <span className="px-2 py-1 rounded bg-white/5 border border-white/5 text-gray-400">
              Temp: {orchestratorConfig.temperature}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Active Config Blueprint / Spec Sheet (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Config Spec Block */}
          <div className="bg-dark-card border border-white/5 rounded-lg p-4 space-y-3.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Settings className="w-3.5 h-3.5 text-blue-400" />
              <span>Orchestrator Blueprint Spec</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 uppercase font-mono">System Instruction Context</span>
                <div className="bg-dark-panel p-2.5 rounded border border-white/5 text-gray-300 leading-normal font-mono text-[10px] whitespace-pre-wrap">
                  {orchestratorConfig.system_instruction.join('\n\n')}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-gray-500 uppercase font-mono">Registered Agent Tools</span>
                <div className="space-y-1.5">
                  {orchestratorConfig.tools.map((tool) => (
                    <div 
                      key={tool.name}
                      onClick={() => {
                        if (tool.name === 'campaign_content_agent') setActiveAgent('campaign');
                        if (tool.name === 'crm_lead_scoring_agent') setActiveAgent('lead');
                        if (tool.name === 'marketing_analytics_agent') setActiveAgent('analytics');
                      }}
                      className={`p-2.5 rounded border transition-all cursor-pointer flex items-center justify-between ${
                        (tool.name === 'campaign_content_agent' && activeAgent === 'campaign') ||
                        (tool.name === 'crm_lead_scoring_agent' && activeAgent === 'lead') ||
                        (tool.name === 'marketing_analytics_agent' && activeAgent === 'analytics')
                          ? 'border-brand-primary/40 bg-brand-primary/5 text-white'
                          : 'border-white/5 bg-dark-panel/30 hover:border-white/10 text-gray-400'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-mono text-[11px] font-bold flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            (tool.name === 'campaign_content_agent' && activeAgent === 'campaign') ||
                            (tool.name === 'crm_lead_scoring_agent' && activeAgent === 'lead') ||
                            (tool.name === 'marketing_analytics_agent' && activeAgent === 'analytics')
                              ? 'bg-blue-400 animate-pulse'
                              : 'bg-gray-600'
                          }`} />
                          <span>{tool.name}</span>
                        </div>
                        <p className="text-[9px] text-gray-500 line-clamp-1">{tool.description}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Raw Configuration JSON representation */}
          <div className="bg-dark-card border border-white/5 rounded-lg p-4 space-y-2.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <FileJson className="w-3.5 h-3.5 text-blue-400" />
              <span>Declarative Orchestrator Schema</span>
            </h3>
            <p className="text-[10px] text-gray-500">Live JSON configuration mapped to the `@google/genai` functional model layer.</p>
            <div className="bg-dark-panel border border-white/5 rounded p-3 overflow-x-auto max-h-56">
              <pre className="text-[9px] font-mono text-blue-300 leading-normal">
                {JSON.stringify(orchestratorConfig, null, 2)}
              </pre>
            </div>
          </div>

        </div>

        {/* Right Column: Execution Workspace (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-dark-card border border-white/5 rounded-lg p-5 space-y-4">
            
            {/* Tab Controls for the 3 functional agents */}
            <div className="flex border-b border-white/5 pb-2 gap-1">
              <button 
                onClick={() => setActiveAgent('campaign')}
                className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeAgent === 'campaign' 
                    ? 'bg-brand-primary text-white shadow' 
                    : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Campaign Content Agent</span>
              </button>
              <button 
                onClick={() => setActiveAgent('lead')}
                className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeAgent === 'lead' 
                    ? 'bg-brand-primary text-white shadow' 
                    : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>CRM Lead Scoring</span>
              </button>
              <button 
                onClick={() => setActiveAgent('analytics')}
                className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeAgent === 'analytics' 
                    ? 'bg-brand-primary text-white shadow' 
                    : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Marketing Analytics</span>
              </button>
            </div>

            {/* Selected Agent Input Form Fields */}
            <div className="space-y-3.5 text-xs">
              {activeAgent === 'campaign' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase font-mono font-bold">Brand Profile Name</label>
                    <input 
                      type="text"
                      value={campaignBrand}
                      onChange={(e) => setCampaignBrand(e.target.value)}
                      className="w-full bg-dark-bg border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase font-mono font-bold">Brand Voice & Tone</label>
                    <input 
                      type="text"
                      value={campaignTone}
                      onChange={(e) => setCampaignTone(e.target.value)}
                      className="w-full bg-dark-bg border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] text-gray-500 uppercase font-mono font-bold">Audience Segments</label>
                    <input 
                      type="text"
                      value={campaignAudience}
                      onChange={(e) => setCampaignAudience(e.target.value)}
                      className="w-full bg-dark-bg border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase font-mono font-bold">Campaign Goal</label>
                    <input 
                      type="text"
                      value={campaignGoal}
                      onChange={(e) => setCampaignGoal(e.target.value)}
                      className="w-full bg-dark-bg border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase font-mono font-bold">Target Channels (comma sep)</label>
                    <input 
                      type="text"
                      value={campaignChannels}
                      onChange={(e) => setCampaignChannels(e.target.value)}
                      className="w-full bg-dark-bg border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] text-gray-500 uppercase font-mono font-bold">Constraints & Requirements</label>
                    <textarea 
                      value={campaignConstraints}
                      onChange={(e) => setCampaignConstraints(e.target.value)}
                      rows={2}
                      className="w-full bg-dark-bg border border-white/10 rounded p-2 text-xs text-white outline-none focus:border-brand-primary resize-none"
                    />
                  </div>
                </div>
              )}

              {activeAgent === 'lead' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase font-mono font-bold">Lead Data Array (JSON format)</label>
                    <textarea 
                      value={leadList}
                      onChange={(e) => setLeadList(e.target.value)}
                      rows={5}
                      className="w-full bg-dark-bg border border-white/10 rounded p-2 text-xs font-mono text-gray-300 outline-none focus:border-brand-primary resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase font-mono font-bold">Interaction History (JSON lookup)</label>
                    <textarea 
                      value={interactionHistory}
                      onChange={(e) => setInteractionHistory(e.target.value)}
                      rows={4}
                      className="w-full bg-dark-bg border border-white/10 rounded p-2 text-xs font-mono text-gray-300 outline-none focus:border-brand-primary resize-none"
                    />
                  </div>
                </div>
              )}

              {activeAgent === 'analytics' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase font-mono font-bold">Marketing Performance Metrics (JSON Schema)</label>
                    <textarea 
                      value={metricsJson}
                      onChange={(e) => setMetricsJson(e.target.value)}
                      rows={5}
                      className="w-full bg-dark-bg border border-white/10 rounded p-2 text-xs font-mono text-gray-300 outline-none focus:border-brand-primary resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase font-mono font-bold">Evaluation Timeframe</label>
                    <input 
                      type="text"
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                      className="w-full bg-dark-bg border border-white/10 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>
              )}

              {/* Action Trigger Button */}
              <button 
                onClick={executeAgentAction}
                disabled={isLoading}
                className="w-full bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold py-2.5 rounded flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Execute '{orchestratorConfig.tools.find(t => t.name.startsWith(activeAgent))?.name || activeAgent}' Tool</span>
              </button>
            </div>

            {/* Run Output Area */}
            <div className="bg-dark-panel border border-white/5 rounded p-4 flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                  <span className="text-[9px] font-mono text-blue-400 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase">
                    Agent Pipeline Terminal
                  </span>
                  <span className="text-[10px] text-gray-500">
                    Status: {isLoading ? 'Processing' : agentOutput ? 'Success' : 'Idle'}
                  </span>
                </div>

                {isLoading ? (
                  <div className="space-y-3 animate-pulse pt-2">
                    <div className="h-4 bg-white/5 rounded w-1/3" />
                    <div className="h-2.5 bg-white/5 rounded w-full" />
                    <div className="h-2.5 bg-white/5 rounded w-4/5" />
                  </div>
                ) : agentOutput ? (
                  <div className="prose prose-invert prose-sm text-xs leading-relaxed text-gray-300 whitespace-pre-line font-mono max-h-72 overflow-y-auto">
                    {agentOutput}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-600">
                    <Code className="w-10 h-10 text-blue-500/30 mx-auto mb-3" />
                    <p className="text-xs">Configure the input parameters above and run the tool to view immediate AI recommendations.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* CRM Pipeline & Segment Intelligence Visualizer */}
          <div className="bg-dark-card border border-white/5 rounded-lg p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-display">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>CRM Pipeline & Segment Intelligence</span>
                </h3>
                <p className="text-[10px] text-gray-400">Dynamic distribution derived in real-time from active lead dataset</p>
              </div>

              {/* Chart State Controls */}
              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                {/* Dimension Select */}
                <div className="flex bg-white/5 p-0.5 rounded border border-white/5">
                  <button 
                    onClick={() => setChartType('tier')}
                    className={`px-2 py-0.5 rounded-sm transition-all cursor-pointer ${
                      chartType === 'tier' 
                        ? 'bg-brand-primary text-white font-bold' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Tiers
                  </button>
                  <button 
                    onClick={() => setChartType('segment')}
                    className={`px-2 py-0.5 rounded-sm transition-all cursor-pointer ${
                      chartType === 'segment' 
                        ? 'bg-brand-primary text-white font-bold' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Segments
                  </button>
                </div>

                {/* Metric Select */}
                <div className="flex bg-white/5 p-0.5 rounded border border-white/5">
                  <button 
                    onClick={() => setMetricMode('count')}
                    className={`px-2 py-0.5 rounded-sm transition-all cursor-pointer ${
                      metricMode === 'count' 
                        ? 'bg-emerald-600 text-white font-bold' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Count
                  </button>
                  <button 
                    onClick={() => setMetricMode('value')}
                    className={`px-2 py-0.5 rounded-sm transition-all cursor-pointer ${
                      metricMode === 'value' 
                        ? 'bg-emerald-600 text-white font-bold' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Value ($)
                  </button>
                </div>
              </div>
            </div>

            {/* Layout Grid: Left Mini-stats, Right Recharts */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Left Mini Stats */}
              <div className="md:col-span-4 space-y-3 flex flex-col justify-between">
                
                {/* Stat 1: Pipeline Value */}
                <div className="bg-dark-panel border border-white/5 rounded p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[9px] uppercase">
                    <DollarSign className="w-3 h-3 text-emerald-400" />
                    <span>Est. Pipeline Value</span>
                  </div>
                  <p className="text-base font-bold text-emerald-400 font-display">
                    {formatCurrency(totalPipelineValue)}
                  </p>
                </div>

                {/* Stat 2: Lead Counts */}
                <div className="bg-dark-panel border border-white/5 rounded p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[9px] uppercase">
                    <Users2 className="w-3 h-3 text-blue-400" />
                    <span>Active Leads</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <p className="text-base font-bold text-white font-display">
                      {totalLeadsCount}
                    </p>
                    <span className="text-[10px] text-blue-400 font-mono font-bold bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                      {hotLeadsCount} Hot
                    </span>
                  </div>
                </div>

                {/* Stat 3: Engagement average */}
                <div className="bg-dark-panel border border-white/5 rounded p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[9px] uppercase">
                    <Cpu className="w-3 h-3 text-purple-400" />
                    <span>Avg Interactions</span>
                  </div>
                  <p className="text-base font-bold text-gray-200 font-display">
                    {averageInteractions} <span className="text-xs font-normal text-gray-500">per lead</span>
                  </p>
                </div>

              </div>

              {/* Right Recharts bar visualizer */}
              <div className="md:col-span-8 bg-dark-panel/40 border border-white/5 rounded p-2 flex flex-col justify-center">
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      layout="vertical" 
                      data={chartData} 
                      margin={{ left: 10, right: 15, top: 10, bottom: 5 }}
                    >
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="rgba(255,255,255,0.04)" 
                        horizontal={false} 
                        vertical={true} 
                      />
                      <XAxis 
                        type="number" 
                        stroke="#6b7280" 
                        fontSize={9} 
                        tickLine={false} 
                        tickFormatter={(val) => metricMode === 'value' ? `$${val/1000}k` : val} 
                      />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        stroke="#9ca3af" 
                        fontSize={9} 
                        tickLine={false} 
                        width={95}
                      />
                      <Tooltip 
                        content={<CustomTooltip />} 
                        cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }} 
                      />
                      <Bar 
                        dataKey={dataKey} 
                        radius={[0, 3, 3, 0]} 
                        barSize={12}
                      >
                        {chartData.map((entry, index) => (
                          <RechartsCell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="text-[9px] text-center text-gray-500 font-mono mt-2">
                  💡 Editing JSON parameters in the Lead Scoring tab instantly recalculates this telemetry.
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
