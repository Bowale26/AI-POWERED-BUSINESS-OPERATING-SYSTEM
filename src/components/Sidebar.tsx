import React from 'react';
import { 
  LayoutDashboard, 
  Terminal,
  Briefcase, 
  Users2,
  Cpu, 
  Clock,
  FileText,
  Sparkles,
  Sliders,
  Search,
  CheckCircle2,
  Layers,
  TrendingUp,
  MessageSquare,
  Phone,
  GitBranch, 
  BarChart3, 
  BookOpen,
  Link2, 
  Wrench, 
  Shield,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { AppTab } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  systemStatus: {
    status: string;
    efficiency: string;
    geminiKeyConfigured: boolean;
  };
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, systemStatus, isCollapsed, setIsCollapsed }: SidebarProps) {
  const coreItems = [
    { id: 'welcome' as AppTab, label: 'Welcome Overview', icon: LayoutDashboard, desc: 'SaaS Briefing' },
    { id: 'command' as AppTab, label: 'Unified Command Center', icon: Terminal, desc: 'Direct Control Room' },
    { id: 'operations' as AppTab, label: 'Operations Navigation', icon: Briefcase, desc: 'Process & Pipelines' },
    { id: 'leads' as AppTab, label: 'CRM Leads Pipeline', icon: Users2, desc: 'Leads Kanban Board' },
    { id: 'task_agent' as AppTab, label: 'AI Task Agent', icon: Cpu, desc: 'Automation Scheduler' },
    { id: 'stopwatch' as AppTab, label: 'Focus Stopwatch', icon: Clock, desc: 'Pomodoro Productivity' },
    { id: 'digest' as AppTab, label: 'AI Executive Digest', icon: FileText, desc: 'Memo Generator' },
    { id: 'suite' as AppTab, label: 'Enterprise AI Suite', icon: Sparkles, desc: 'Multi-Agent Orchestration' },
    { id: 'sandbox' as AppTab, label: 'Interactive AI Sandbox', icon: Sliders, desc: 'Prompt Playground' },
  ];

  const growthItems = [
    { id: 'prospecting' as AppTab, label: 'Prospecting Tool', icon: Search, desc: 'AI lead qualification' },
    { id: 'forms' as AppTab, label: 'Forms, Surveys & Quizzes', icon: CheckCircle2, desc: 'Conversion builder' },
    { id: 'funnels' as AppTab, label: 'Funnels & Landing Pages', icon: Layers, desc: 'Page copies & layouts' },
    { id: 'ads' as AppTab, label: 'Ads Manager', icon: TrendingUp, desc: 'Creative variations' },
    { id: 'chat_widget' as AppTab, label: 'Chat Widget / Conv AI', icon: MessageSquare, desc: 'Web chatflows' },
    { id: 'call_tracking' as AppTab, label: 'Call Tracking', icon: Phone, desc: 'Intent scoring' },
  ];

  const systemItems = [
    { id: 'workflows' as AppTab, label: 'Automation & Workflows', icon: GitBranch, desc: 'Trigger maps' },
    { id: 'analytics' as AppTab, label: 'Analytics & Insights', icon: BarChart3, desc: 'RAG metric interpreter' },
    { id: 'knowledge' as AppTab, label: 'Knowledge & Documents', icon: BookOpen, desc: 'SOP & Documents analyst' },
    { id: 'integrations' as AppTab, label: 'Integrations', icon: Link2, desc: 'SaaS APIs & connectors' },
    { id: 'maintenance' as AppTab, label: 'Maintenance', icon: Wrench, desc: 'Telemetry & releases' },
    { id: 'admin' as AppTab, label: 'Admin & Security', icon: Shield, desc: 'Access & Key audit' },
  ];

  const renderNavGroup = (title: string, items: typeof coreItems) => (
    <div className="space-y-1">
      {!isCollapsed && (
        <p className="px-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 font-mono">
          {title}
        </p>
      )}
      {items.map((item) => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            id={`sidebar-nav-${item.id}`}
            onClick={() => setActiveTab(item.id)}
            title={isCollapsed ? `${item.label} - ${item.desc}` : undefined}
            className={`w-full flex items-center px-3 py-1.5 rounded transition-all duration-150 cursor-pointer text-left ${
              isCollapsed ? 'justify-center gap-0' : 'gap-2.5'
            } ${
              isActive 
                ? 'bg-white/5 text-white font-semibold border-l-2 border-brand-primary pl-2' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-brand-primary' : 'text-gray-500'}`} />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[11px] leading-tight">{item.label}</div>
                <div className="text-[8px] text-gray-500 truncate">{item.desc}</div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <aside className={`bg-dark-panel border-r border-white/5 flex flex-col justify-between text-gray-300 select-none shrink-0 h-full transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-[calc(100%-110px)]">
        {/* Brand Header */}
        <div className={`p-4 border-b border-white/5 shrink-0 ${isCollapsed ? 'flex flex-col items-center justify-center gap-2' : ''}`}>
          <div className="flex items-center justify-between gap-2.5 w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 bg-brand-primary rounded flex items-center justify-center font-bold text-white text-xs shrink-0 shadow">
                <Cpu className="w-4 h-4 animate-pulse text-white" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <h1 className="font-display font-bold tracking-tight text-[11px] text-white uppercase leading-none truncate">CRM ORCHESTRATOR</h1>
                  <p className="text-[9px] text-blue-500 font-mono tracking-wider uppercase mt-1">AI-BOS Suite v1.5</p>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-white transition-all cursor-pointer shrink-0"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
          
          {/* Status Sub-Bar */}
          {!isCollapsed && (
            <div className="mt-2.5 p-2 bg-dark-bg/60 rounded border border-white/5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[9px] text-gray-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                <span>SYSTEM ONLINE</span>
              </span>
              <span className="text-[9px] font-mono text-blue-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                {systemStatus.efficiency} EFF
              </span>
            </div>
          )}
        </div>

        {/* Scrollable Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-2.5 space-y-4 scrollbar-thin scrollbar-thumb-white/5">
          {renderNavGroup('Core Workspace', coreItems)}
          {renderNavGroup('Growth Engine', growthItems)}
          {renderNavGroup('System & Security', systemItems)}
        </nav>
      </div>

      {/* Footer / Telemetry indicators */}
      {!isCollapsed ? (
        <div className="p-3 bg-dark-bg m-2.5 rounded border border-white/5 space-y-2 shrink-0">
          <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
            <span>AI AGENT LOAD</span>
            <span className="text-blue-400">42%</span>
          </div>
          <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand-primary w-[42%]"></div>
          </div>
          <div className="pt-2 border-t border-white/5 flex flex-col gap-1 text-[9px] text-gray-500 font-mono">
            <div className="flex justify-between">
              <span>MODEL</span>
              <span className="text-gray-300">gemini-3.1-pro-preview</span>
            </div>
            <div className="flex justify-between">
              <span>API KEY</span>
              <span className={systemStatus.geminiKeyConfigured ? 'text-emerald-400 font-semibold' : 'text-amber-500 font-semibold'}>
                {systemStatus.geminiKeyConfigured ? 'CONNECTED' : 'PROXIED'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 flex justify-center items-center">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-emerald-400 shadow-sm" title="System Online (98.4% Efficiency)" />
        </div>
      )}
    </aside>
  );
}
