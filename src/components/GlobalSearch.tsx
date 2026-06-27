import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Sparkles, 
  ChevronRight, 
  Loader2, 
  CornerDownLeft, 
  X, 
  Command, 
  FileText, 
  FolderOpen, 
  User, 
  Zap 
} from 'lucide-react';
import { AppTab } from '../types';
import { useNotifications } from './NotificationProvider';

interface GlobalSearchProps {
  setActiveTab: (tab: AppTab) => void;
  activeTab: AppTab;
}

interface SearchableItem {
  category: 'Pillar Workspace' | 'Knowledge Documents' | 'CRM Lead Entity' | 'Automation Workflow';
  title: string;
  subtitle: string;
  tab: AppTab;
  keywords: string;
}

const SEARCHABLE_ITEMS: SearchableItem[] = [
  // Pillars
  {
    category: 'Pillar Workspace',
    title: 'Welcome SaaS Overview & Briefing',
    subtitle: 'App workspace dashboard with KPIs and daily briefings',
    tab: 'welcome',
    keywords: 'dashboard, metrics, welcome, overview, kpi, saas, business, summary'
  },
  {
    category: 'Pillar Workspace',
    title: 'Unified AI Command Center',
    subtitle: 'Command bar and orchestration launcher',
    tab: 'command',
    keywords: 'command, action, launcher, execute, terminal, run, console'
  },
  {
    category: 'Pillar Workspace',
    title: 'Operations & Pipelines Manager',
    subtitle: 'Standard processes and corporate compliance tracks',
    tab: 'operations',
    keywords: 'operations, pipelines, hub, compliance, standard'
  },
  {
    category: 'Pillar Workspace',
    title: 'CRM Kanban Leads Pipeline',
    subtitle: 'Track active high-intent lead cards',
    tab: 'leads',
    keywords: 'kanban, lead, contact, crm, sales, pipeline, pipeline, clients'
  },
  {
    category: 'Pillar Workspace',
    title: 'AI Automation Task Agent',
    subtitle: 'Manage autonomous background agents',
    tab: 'task_agent',
    keywords: 'agent, task, automation, quickbooks, lead, background, worker'
  },
  {
    category: 'Pillar Workspace',
    title: 'Pomodoro Focus Stopwatch',
    subtitle: 'Stopwatch and productivity timer tracking',
    tab: 'stopwatch',
    keywords: 'pomodoro, focus, stopwatch, timer, productivity, tracker, clock'
  },
  {
    category: 'Pillar Workspace',
    title: 'AI Executive Memorandum Digest',
    subtitle: 'Generate daily or weekly memorandums',
    tab: 'digest',
    keywords: 'executive, digest, memo, report, summary, board'
  },
  {
    category: 'Pillar Workspace',
    title: 'Enterprise AI Suite Orchestrator',
    subtitle: 'Advanced orchestrator setups and configs',
    tab: 'suite',
    keywords: 'enterprise, suite, orchestrator, config, global'
  },
  {
    category: 'Pillar Workspace',
    title: 'Interactive Prompt & LLM Sandbox',
    subtitle: 'Experiment with temperature and system instructions',
    tab: 'sandbox',
    keywords: 'sandbox, prompt, test, llm, temperature, playground, engineering'
  },
  {
    category: 'Pillar Workspace',
    title: 'AI Prospect Discovery & Enrichment',
    subtitle: 'Find target leads and companies',
    tab: 'prospecting',
    keywords: 'prospect, discovery, list, search, clearbit, zoominfo, enrichment, corporate'
  },
  {
    category: 'Pillar Workspace',
    title: 'Forms, Surveys & Conversion Quizzes',
    subtitle: 'Interactive customer capture mechanisms',
    tab: 'forms',
    keywords: 'forms, surveys, quiz, questionnaires, lead capture, data, question'
  },
  {
    category: 'Pillar Workspace',
    title: 'Funnels & High-Impact Landing Pages',
    subtitle: 'Design high-converting page structures',
    tab: 'funnels',
    keywords: 'landing, page, funnels, website, conversion, builder, static, high-impact'
  },
  {
    category: 'Pillar Workspace',
    title: 'Google, Facebook & Instagram Ads Manager',
    subtitle: 'Create ad variations with AI-powered copywriting',
    tab: 'ads',
    keywords: 'ads, google, facebook, instagram, copy, marketing, spend, cost'
  },
  {
    category: 'Pillar Workspace',
    title: 'Conversation AI & Live Web Chat Widgets',
    subtitle: 'Embed responsive conversational live-chat bots',
    tab: 'chat_widget',
    keywords: 'chat, live-chat, widget, support, customer, visitor, online'
  },
  {
    category: 'Pillar Workspace',
    title: 'Voice Transcripts & Intent Scorers',
    subtitle: 'Track inbound audio logs and score intent',
    tab: 'call_tracking',
    keywords: 'voice, transcript, phone, recording, crm log, scoring, call'
  },
  {
    category: 'Pillar Workspace',
    title: 'Low-Code Automation Trigger Maps',
    subtitle: 'Orchestrate Slack notifications and custom integrations',
    tab: 'workflows',
    keywords: 'workflow, triggers, automation, maps, slack, builder'
  },
  {
    category: 'Pillar Workspace',
    title: 'RAG Metrics & Analytics Insights',
    subtitle: 'Advanced feedback tracking and analytics',
    tab: 'analytics',
    keywords: 'metrics, charts, analytics, performance, data, feedback'
  },
  {
    category: 'Pillar Workspace',
    title: 'Corporate Document Analysis & SOPs',
    subtitle: 'Audit PDF/markdown files and generate instructions',
    tab: 'knowledge',
    keywords: 'document, sops, files, knowledge, guidelines, corporate'
  },
  {
    category: 'Pillar Workspace',
    title: 'API Integrations & SaaS Connectors',
    subtitle: 'Connect HubSpot, QuickBooks, and Slack tokens',
    tab: 'integrations',
    keywords: 'integrations, api, hubspot, quickbooks, slack, token, keys'
  },
  {
    category: 'Pillar Workspace',
    title: 'Reliability Telemetry & System Maintenance',
    subtitle: 'Docker container, SSL, and DB uptime health',
    tab: 'maintenance',
    keywords: 'maintenance, telemetry, uptime, server, logs, health, docker'
  },
  {
    category: 'Pillar Workspace',
    title: 'Tenant Access, Cryptographic Keys & Audits',
    subtitle: 'Secure API keys and compliance log sweeps',
    tab: 'admin',
    keywords: 'admin, security, keys, logs, compliance, api, iso, roles, rbac'
  },

  // Documents
  {
    category: 'Knowledge Documents',
    title: 'Corporate_SOP_Draft.md',
    subtitle: 'Standard operating procedures for team onboarding and compliance',
    tab: 'knowledge',
    keywords: 'sop, corporate, draft, markdown, onboarding, standards'
  },
  {
    category: 'Knowledge Documents',
    title: 'Q3_Enterprise_Strategic_Brief.pdf',
    subtitle: 'Strategic alignment goals and growth targets for Q3',
    tab: 'knowledge',
    keywords: 'q3, strategic, enterprise, report, briefing, growth, goals'
  },
  {
    category: 'Knowledge Documents',
    title: 'Salesforce_HubSpot_Integration_Guide.pdf',
    subtitle: 'Technical guide for mapping lead scores and syncing timelines',
    tab: 'knowledge',
    keywords: 'salesforce, hubspot, guide, mapping, timeline, crm, setup'
  },

  // Active leads
  {
    category: 'CRM Lead Entity',
    title: 'Sarah Jenkins (Alpha Corp)',
    subtitle: 'Score: 92 | Qualified Enterprise Lead (Downloaded Technical Paper)',
    tab: 'leads',
    keywords: 'sarah, jenkins, alpha, corp, enterprise, score'
  },
  {
    category: 'CRM Lead Entity',
    title: 'Elena Rostova (Novis Tech)',
    subtitle: 'Score: 96 | Custom sandbox demo requested ($110k value)',
    tab: 'leads',
    keywords: 'elena, rostova, novis, tech, sandbox, demo, score, budget'
  },
  {
    category: 'CRM Lead Entity',
    title: 'Robert Downey',
    subtitle: 'Score: 89 | Virtual Inbound Call Recording (HubSpot Leads query)',
    tab: 'call_tracking',
    keywords: 'robert, downey, phone, call, transcription, voicemail'
  },

  // Active Workflows
  {
    category: 'Automation Workflow',
    title: 'High-Score Lead FastTrack Pipeline',
    subtitle: 'Trigger: CRM Lead Created | Status: Active (+34% Efficiency)',
    tab: 'workflows',
    keywords: 'workflow, pipeline, lead, active, efficiency, track'
  },
  {
    category: 'Automation Workflow',
    title: 'Automated Campaign Content Generation Loop',
    subtitle: 'Trigger: Monthly Campaign Scheduled | Status: Draft (+48% Efficiency)',
    tab: 'workflows',
    keywords: 'campaign, draft, monthly, automation, content, loop'
  }
];

export default function GlobalSearch({ setActiveTab, activeTab }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchableItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // AI Search state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  const { addToast } = useNotifications();
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle modal on Command + K / Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter items based on query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      setAiAnswer(null);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = SEARCHABLE_ITEMS.filter((item) => {
      return (
        item.title.toLowerCase().includes(searchTerm) ||
        item.subtitle.toLowerCase().includes(searchTerm) ||
        item.keywords.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm)
      );
    });

    setResults(filtered.slice(0, 8)); // Limit to top 8
    setSelectedIndex(0);
    setAiAnswer(null); // Reset AI answer on query change
  }, [query]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSelect = (item: SearchableItem) => {
    setActiveTab(item.tab);
    setIsOpen(false);
    addToast(
      `Redirected to workspace pillar: "${item.title}"`,
      'success',
      3500
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (results.length + (query ? 1 : 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (results.length + (query ? 1 : 0))) % (results.length + (query ? 1 : 0)));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Check if last item is selected (which could be the "Ask AI" row if query is active)
      if (query && selectedIndex === results.length) {
        handleAiSearch();
      } else if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  const handleAiSearch = async () => {
    if (!query.trim() || aiLoading) return;
    setAiLoading(true);
    setAiAnswer('Inbound to AI Search Core... Mapping semantic indices via Gemini...');
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Acting as SaaS enterprise search index assistant, quickly answer this user business/operational inquiry in 2 sentences maximum, linking it to CRM, leads, campaigns, or system metrics: "${query}"`,
          tab: activeTab
        })
      });
      const data = await response.json();
      setAiAnswer(data.text);
      addToast('AI Intelligence response compiled successfully.', 'system', 3000);
    } catch (err) {
      setAiAnswer('Enterprise search context resolved. Suggest configuring Salesforce CRM or looking up Lead Kanban boards.');
      addToast('Local intelligence search fallback completed.', 'info', 3000);
    } finally {
      setAiLoading(false);
    }
  };

  // Close modal when clicking outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Pillar Workspace':
        return <FolderOpen className="w-3.5 h-3.5 text-blue-400" />;
      case 'Knowledge Documents':
        return <FileText className="w-3.5 h-3.5 text-amber-400" />;
      case 'CRM Lead Entity':
        return <User className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Automation Workflow':
        return <Zap className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  return (
    <>
      {/* Top Bar Quick Access Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full max-w-sm bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg px-3 py-1.5 flex items-center justify-between transition-all text-xs text-gray-400 group cursor-pointer"
        id="global-search-trigger"
      >
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
          <span className="truncate group-hover:text-gray-200">Search pillars, SOPs, leads...</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[9px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded border border-white/5">
          <Command className="w-2.5 h-2.5" />
          <span>K</span>
        </div>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          onClick={handleOverlayClick}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center p-4 animate-fadeIn"
          id="global-search-modal-overlay"
        >
          <div
            ref={modalRef}
            className="w-full max-w-2xl bg-dark-panel border border-white/10 rounded-xl shadow-2xl overflow-hidden mt-[12vh] flex flex-col max-h-[70vh]"
            id="global-search-modal-container"
          >
            {/* Header Input */}
            <div className="flex items-center gap-3 p-4 border-b border-white/5">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type to search system pillars, leads, campaigns, workflow SOPs..."
                className="flex-1 bg-transparent border-none text-white placeholder-gray-500 text-sm outline-none font-sans"
                id="global-search-input"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-gray-500 hover:text-white transition-all cursor-pointer p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 border border-white/10 rounded text-[9px] font-mono text-gray-500 bg-white/5 shrink-0">
                <span>ESC to close</span>
              </div>
            </div>

            {/* Results / Navigation Body */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin space-y-2">
              {/* If no query, show help & quick links */}
              {!query.trim() && (
                <div className="p-4 space-y-4">
                  <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider font-mono">
                    Quick Navigation Links
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { title: 'Dashboard overview', tab: 'welcome' as AppTab },
                      { title: 'Kanban Leads Pipeline', tab: 'leads' as AppTab },
                      { title: 'Automation Task Agent', tab: 'task_agent' as AppTab },
                      { title: 'Interactive AI Sandbox', tab: 'sandbox' as AppTab },
                      { title: 'Document Analyzer & SOPs', tab: 'knowledge' as AppTab },
                      { title: 'Security & Key Sweep', tab: 'admin' as AppTab }
                    ].map((link, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveTab(link.tab);
                          setIsOpen(false);
                          addToast(`Routed to: ${link.title}`, 'info', 2000);
                        }}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-left text-xs text-gray-200 cursor-pointer transition-all"
                      >
                        <span className="font-semibold">{link.title}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching list */}
              {query.trim() && results.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 pb-1.5 text-[9.5px] uppercase font-bold text-gray-500 tracking-wider font-mono">
                    Search Results ({results.length})
                  </div>
                  {results.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-white/10 border-l-4 border-l-blue-400' 
                            : 'bg-transparent border-l-4 border-l-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded bg-white/5 shrink-0">
                            {getCategoryIcon(item.category)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-white truncate">{item.title}</span>
                              <span className="text-[8.5px] font-mono text-gray-500 uppercase px-1 py-0.2 bg-white/5 rounded">
                                {item.category}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5 truncate">{item.subtitle}</p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex items-center gap-1 font-mono text-[8px] text-gray-400 shrink-0">
                            <span>Navigate</span>
                            <CornerDownLeft className="w-2.5 h-2.5 text-gray-500" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* "Ask AI" Row */}
              {query.trim() && (
                <div className="pt-2 border-t border-white/5 mt-2">
                  <button
                    onClick={handleAiSearch}
                    onMouseEnter={() => setSelectedIndex(results.length)}
                    className={`w-full p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                      selectedIndex === results.length 
                        ? 'bg-purple-950/30 border border-purple-500/30' 
                        : 'bg-white/5 border border-transparent hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded bg-purple-500/10 shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Semantic AI Search Analysis</span>
                          {aiLoading && <Loader2 className="w-3 h-3 text-purple-400 animate-spin" />}
                        </p>
                        <p className="text-[10px] text-gray-400">Ask Gemini to semantically evaluate: "{query}"</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-purple-400 border border-purple-400/20 px-2 py-0.5 rounded bg-purple-400/5">
                      GENERATE ANSWER
                    </span>
                  </button>
                </div>
              )}

              {/* AI Answer Block */}
              {aiAnswer && (
                <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-lg mt-3 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Gemini Response Context</span>
                    </span>
                    <button
                      onClick={() => setAiAnswer(null)}
                      className="text-[9px] text-gray-500 hover:text-white uppercase font-mono"
                    >
                      Clear
                    </button>
                  </div>
                  <p className="text-xs text-purple-100 font-sans leading-relaxed">
                    {aiAnswer}
                  </p>
                </div>
              )}

              {/* If search yields absolutely no local results and user hasn't queried AI */}
              {query.trim() && results.length === 0 && !aiAnswer && (
                <div className="p-6 text-center text-gray-500 space-y-2">
                  <Search className="w-8 h-8 mx-auto text-gray-600" />
                  <p className="text-xs font-mono">No direct matches found in system indexes.</p>
                  <p className="text-[10px] text-gray-600">Click the "Semantic AI Search Analysis" above to invoke LLM context mapping.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t border-white/5 bg-black/40 flex justify-between items-center text-[9px] font-mono text-gray-500 shrink-0">
              <div className="flex items-center gap-3">
                <span>↑↓ to navigate</span>
                <span>↵ to select</span>
              </div>
              <div>
                <span>Press ESC to cancel</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
