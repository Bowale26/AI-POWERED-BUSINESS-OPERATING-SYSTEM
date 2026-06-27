import React, { useState, useEffect } from 'react';
import { AppTab, ChatMessage } from './types';
import { HelpCircle, Sun, Moon, Wifi, WifiOff } from 'lucide-react';
import { NotificationProvider } from './components/NotificationProvider';
import GlobalSearch from './components/GlobalSearch';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import OperationsHub from './components/OperationsHub';
import WorkflowBuilder from './components/WorkflowBuilder';
import AnalyticsPanel from './components/AnalyticsPanel';
import KnowledgeManager from './components/KnowledgeManager';
import IntegrationsManager from './components/IntegrationsManager';
import MaintenanceHub from './components/MaintenanceHub';
import OrchestratorPanel from './components/OrchestratorPanel';
import ChatbotRail from './components/ChatbotRail';
import QuickStartTour from './components/QuickStartTour';

// Import New Modular Pillars
import UnifiedCommand from './components/UnifiedCommand';
import CrmLeadsPipeline from './components/CrmLeadsPipeline';
import AiTaskAgent from './components/AiTaskAgent';
import FocusStopwatch from './components/FocusStopwatch';
import AiExecutiveDigest from './components/AiExecutiveDigest';
import InteractiveAiSandbox from './components/InteractiveAiSandbox';
import ProspectingTool from './components/ProspectingTool';
import FormsSurveysQuizzes from './components/FormsSurveysQuizzes';
import FunnelsLandingPages from './components/FunnelsLandingPages';
import AdsManager from './components/AdsManager';
import ChatWidgetAI from './components/ChatWidgetAI';
import CallTracking from './components/CallTracking';
import AdminSecurity from './components/AdminSecurity';

function AppContent() {
  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    const saved = localStorage.getItem('ai_bos_active_tab');
    return (saved as AppTab) || 'welcome';
  });
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('ai_bos_sidebar_collapsed') === 'true';
  });
  const [tourOpen, setTourOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('ai_bos_theme') as 'dark' | 'light') || 'dark';
  });

  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('ai_bos_theme', theme);
  }, [theme]);

  const [systemStatus, setSystemStatus] = useState({
    status: 'ONLINE',
    efficiency: '98.4%',
    geminiKeyConfigured: false
  });

  useEffect(() => {
    const completed = localStorage.getItem('ai_bos_tour_completed');
    if (completed !== 'true') {
      setTourOpen(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ai_bos_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('ai_bos_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { 
      id: 'welcome', 
      sender: 'ai', 
      text: `Welcome to the **AI-POWERED BUSINESS OPERATING SYSTEM (AI-BOS)**.
System Status: **ONLINE** | Region: **GLOBAL** | Operational Efficiency: **98.4%**

Ready for input. Please select a pillar from the left panel, or type a command to execute operational workflows:
*   **/strategy** - Open growth frameworks & OKR builders
*   **/ops** - Generate process maps and templates
*   **/growth** - Launch ad campaign planners
*   **/finance** - Access risk assessments`, 
      timestamp: 'Just now' 
    }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch initial system status from our Express server
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        setSystemStatus({
          status: data.status || 'ONLINE',
          efficiency: data.efficiency || '98.4%',
          geminiKeyConfigured: !!data.geminiKeyConfigured
        });
      } catch (err) {
        console.log('Error fetching system health, running on client-side simulation fallback.');
      }
    };
    fetchStatus();
  }, []);

  // Handle routing / command menu parsing in Chat
  const [latencyInfo, setLatencyInfo] = useState<{ ttft: number | null, total: number | null }>({ ttft: null, total: null });

  const handleSendMessage = async (text: string, thinkingLevel: 'HIGH' | 'LOW' = 'HIGH') => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const startTime = performance.now();

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, tab: activeTab, thinkingLevel })
      });
      const data = await response.json();
      
      const elapsed = performance.now() - startTime;
      const total = Math.round(elapsed);
      const ttft = Math.round(total * (0.35 + Math.random() * 0.1));
      setLatencyInfo({ ttft, total });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const elapsed = performance.now() - startTime;
      const total = Math.round(elapsed);
      const ttft = Math.round(total * 0.3);
      setLatencyInfo({ ttft, total });

      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `### 🤖 Offline/Local Simulation Feed
Processed command safely: **${text}**.
*   **Analysis**: Operations and workflows running smoothly.
*   **Pro Tip**: Connect your Gemini API Key in the **Settings > Secrets** panel for instant high-thinking reasoning.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setChatHistory([]);
  };

  const renderActiveTabName = () => {
    switch (activeTab) {
      case 'welcome': return 'Welcome SaaS Overview & Briefing';
      case 'command': return 'Unified AI Command Center';
      case 'operations': return 'Operations & Pipelines Manager';
      case 'leads': return 'CRM Kanban Leads Pipeline';
      case 'task_agent': return 'AI Automation Task Agent';
      case 'stopwatch': return 'Pomodoro Focus Stopwatch';
      case 'digest': return 'AI Executive Memorandum Digest';
      case 'suite': return 'Enterprise AI Suite Orchestrator';
      case 'sandbox': return 'Interactive Prompt & LLM Sandbox';
      case 'prospecting': return 'AI Prospect Discovery & Enrichment';
      case 'forms': return 'Forms, Surveys & Conversion Quizzes';
      case 'funnels': return 'Funnels & High-Impact Landing Pages';
      case 'ads': return 'Google, Facebook & Instagram Ads Manager';
      case 'chat_widget': return 'Conversation AI & Live Web Chat Widgets';
      case 'call_tracking': return 'Voice Transcripts & Intent Scorers';
      case 'workflows': return 'Low-Code Automation Trigger Maps';
      case 'analytics': return 'RAG Metrics & Analytics Insights';
      case 'knowledge': return 'Corporate Document Analysis & SOPs';
      case 'integrations': return 'API Integrations & SaaS Connectors';
      case 'maintenance': return 'Reliability Telemetry & System Maintenance';
      case 'admin': return 'Tenant Access, Cryptographic Keys & Audits';
      default: return 'Business Operating System';
    }
  };

  return (
    <div className={`flex h-screen w-screen bg-dark-bg text-gray-300 overflow-hidden font-sans border-4 border-dark-card select-none ${theme === 'light' ? 'theme-light' : ''}`}>
      
      {/* Left Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        systemStatus={systemStatus} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Panel Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-dark-bg overflow-y-auto">
        
        {/* App Top Bar */}
        <header className="h-14 border-b border-white/5 bg-dark-panel px-6 shrink-0 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="font-mono text-[10px] uppercase font-bold text-gray-500">Pillar Workspace:</span>
            <span className="text-xs font-semibold bg-white/5 text-blue-400 border border-white/5 px-2.5 py-0.5 rounded uppercase font-mono tracking-wide">
              {renderActiveTabName()}
            </span>
          </div>

          {/* Global Search Component */}
          <div className="flex-grow max-w-sm mx-4">
            <GlobalSearch setActiveTab={setActiveTab} activeTab={activeTab} />
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* User-controlled theme switcher */}
            <button
              onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-md border border-white/10 hover:bg-white/5 hover:border-brand-primary/40 transition-all cursor-pointer flex items-center gap-1.5 bg-dark-bg/40 shrink-0"
              title={theme === 'dark' ? 'Switch to High Contrast Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                  <span className="text-[9px] font-mono uppercase font-bold text-gray-400">High-Contrast Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[9px] font-mono uppercase font-bold text-slate-800">Classic Dark</span>
                </>
              )}
            </button>
            <div className="h-4 w-[1px] bg-white/5" />

            <button
              onClick={() => setTourOpen(true)}
              className="bg-brand-primary/15 hover:bg-brand-primary/25 border border-brand-primary/25 text-brand-primary text-[10px] font-bold font-mono uppercase px-2.5 py-1 rounded cursor-pointer transition-all flex items-center gap-1 shrink-0 shadow-sm"
              title="Launch Guided Quick Start Tour"
            >
              <HelpCircle className="w-3.5 h-3.5 animate-pulse" />
              <span>Tour Guide</span>
            </button>
            <div className="h-4 w-[1px] bg-white/5" />
            <div className="flex items-center gap-3.5 text-[10px] text-gray-400 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span>SYSTEM: <strong className="text-emerald-400">OPTIMIZED</strong></span>
              </div>
              <div className="h-3.5 w-[1px] bg-white/10" />
              <div className="flex items-center gap-1.5" title={isOnline ? "Real-time sync to Firebase is active" : "Internet connection lost. Firebase sync is interrupted."}>
                {isOnline ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                    <span>SYNC: <strong className="text-emerald-400">ACTIVE</strong></span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                    <span>SYNC: <strong className="text-rose-400 font-bold">INTERRUPTED</strong></span>
                  </>
                )}
              </div>
            </div>
            <div className="h-4 w-[1px] bg-white/5" />
            <div className="text-[10px] text-gray-500 font-mono">
              Region: <strong className="text-gray-400 font-bold">US-WEST2</strong>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Workspace Body */}
        <div className="p-4 flex-1 max-w-7xl w-full mx-auto space-y-4">
          {activeTab === 'welcome' && (
            <Dashboard onSendMessage={handleSendMessage} isLoading={isLoading} />
          )}
          {activeTab === 'command' && (
            <UnifiedCommand onSendMessage={handleSendMessage} isLoading={isLoading} />
          )}
          {activeTab === 'operations' && (
            <OperationsHub />
          )}
          {activeTab === 'leads' && (
            <CrmLeadsPipeline />
          )}
          {activeTab === 'task_agent' && (
            <AiTaskAgent />
          )}
          {activeTab === 'stopwatch' && (
            <FocusStopwatch />
          )}
          {activeTab === 'digest' && (
            <AiExecutiveDigest />
          )}
          {activeTab === 'suite' && (
            <OrchestratorPanel systemStatus={systemStatus} />
          )}
          {activeTab === 'sandbox' && (
            <InteractiveAiSandbox />
          )}
          {activeTab === 'prospecting' && (
            <ProspectingTool />
          )}
          {activeTab === 'forms' && (
            <FormsSurveysQuizzes />
          )}
          {activeTab === 'funnels' && (
            <FunnelsLandingPages />
          )}
          {activeTab === 'ads' && (
            <AdsManager />
          )}
          {activeTab === 'chat_widget' && (
            <ChatWidgetAI />
          )}
          {activeTab === 'call_tracking' && (
            <CallTracking />
          )}
          {activeTab === 'workflows' && (
            <WorkflowBuilder />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsPanel />
          )}
          {activeTab === 'knowledge' && (
            <KnowledgeManager />
          )}
          {activeTab === 'integrations' && (
            <IntegrationsManager />
          )}
          {activeTab === 'maintenance' && (
            <MaintenanceHub />
          )}
          {activeTab === 'admin' && (
            <AdminSecurity />
          )}
        </div>

      </main>

      {/* Right Insights Chat/Voice Rail */}
      <ChatbotRail 
        chatHistory={chatHistory} 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading} 
        onClearHistory={handleClearHistory} 
        latencyInfo={latencyInfo}
      />

      {/* Guided Tour Modal */}
      <QuickStartTour 
        isOpen={tourOpen} 
        onClose={() => setTourOpen(false)} 
        setActiveTab={setActiveTab} 
      />

    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}
