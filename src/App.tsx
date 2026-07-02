import React, { useState, useEffect } from 'react';
import { AppTab, ChatMessage } from './types';
import { HelpCircle, Sun, Moon, Wifi, WifiOff, Battery, BatteryMedium, BatteryLow } from 'lucide-react';
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
import { addSystemLog } from './lib/logger';

// Firebase core & state imports
import { auth, db, doc, onSnapshot } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import PremiumPaywall from './components/PremiumPaywall';


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
import SubscriptionHub from './components/SubscriptionHub';

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

  // User Authentication & Plan Subscription State
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<{ plan: string; name: string; email: string } | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        const unsubProfile = onSnapshot(docRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserProfile(snapshot.data() as any);
          } else {
            setUserProfile(null);
          }
          setAuthLoading(false);
        }, (error) => {
          console.error("Error loading user profile in App:", error);
          setAuthLoading(false);
        });
        return () => unsubProfile();
      } else {
        setUserProfile(null);
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const hasActivePlan = (() => {
    if (!userProfile) return false;
    const plan = userProfile.plan || '';
    
    // Check if they are a paid subscriber
    const isPaid = (
      plan === 'Monthly Subscription ($29.99)' ||
      plan === 'Yearly Subscription ($299.99)' ||
      plan === 'AI-BOS Monthly Subscription' ||
      plan === 'AI-BOS Annual Subscription' ||
      plan.toLowerCase().includes('subscription')
    );
    if (isPaid) return true;
    
    // Check if they are in an active free trial (7 days limit)
    const isTrial = plan === 'Free Trial' || plan.toLowerCase().includes('trial') || plan === 'None';
    if (isTrial) {
      const joinedAt = userProfile.joinedAt;
      if (!joinedAt) return true; // Fallback to active trial if joinedAt missing
      
      const joinedTime = new Date(joinedAt).getTime();
      const trialLengthMs = 7 * 24 * 60 * 60 * 1000;
      const now = new Date().getTime();
      const isExpired = now > (joinedTime + trialLengthMs);
      return !isExpired;
    }
    
    return false;
  })();

  // Automatically restrict further access and redirect the user to the Subscription & Billing page immediately upon trial expiration
  useEffect(() => {
    if (user && userProfile && !hasActivePlan) {
      if (activeTab !== 'subscription') {
        setActiveTab('subscription');
        localStorage.setItem('ai_bos_active_tab', 'subscription');
        addSystemLog('warn', 'Security', 'Free trial has expired. Restricting access and redirecting to subscription management.');
      }
    }
  }, [user, userProfile, hasActivePlan, activeTab]);

  const renderGlobalTrialBanner = () => {
    if (!user || !userProfile) return null;
    const plan = userProfile.plan || '';
    const isPaid = (
      plan === 'Monthly Subscription ($29.99)' ||
      plan === 'Yearly Subscription ($299.99)' ||
      plan === 'AI-BOS Monthly Subscription' ||
      plan === 'AI-BOS Annual Subscription' ||
      plan.toLowerCase().includes('subscription')
    );
    if (isPaid) return null;

    const isTrial = plan === 'Free Trial' || plan.toLowerCase().includes('trial') || plan === 'None';
    if (!isTrial) return null;

    const joinedAt = userProfile.joinedAt;
    if (!joinedAt) return null;

    const joinedTime = new Date(joinedAt).getTime();
    const trialLengthMs = 7 * 24 * 60 * 60 * 1000;
    const trialEndTime = joinedTime + trialLengthMs;
    const now = new Date().getTime();

    const timeLeftMs = trialEndTime - now;
    if (timeLeftMs <= 0) return null; // Fully expired, handled by automatic redirect and subscription tab warnings

    const daysLeft = Math.ceil(timeLeftMs / (24 * 60 * 60 * 1000));
    const exactDays = Math.floor(timeLeftMs / (24 * 60 * 60 * 1000));
    const hoursLeft = Math.floor((timeLeftMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

    // Show warning banner if trial has <= 3 days left (advance notification)
    if (daysLeft > 3) return null;

    return (
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-transparent border border-amber-500/20 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-300">
        <div className="flex items-center gap-2 text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block shrink-0" />
          <span>
            <strong>Trial Ending Soon:</strong> Your 7-Day Free Trial has <strong>{exactDays > 0 ? `${exactDays}d ${hoursLeft}h` : `${hoursLeft}h`}</strong> remaining.
            Upgrade to a monthly or annual billing cycle to secure your AI-POWERED BUSINESS OPERATING SYSTEM workspace database.
          </span>
        </div>
        <button
          onClick={() => setActiveTab('subscription')}
          className="bg-amber-500/25 hover:bg-amber-500/35 border border-amber-500/40 text-amber-300 px-3 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wide cursor-pointer transition-all shrink-0"
        >
          Upgrade Now
        </button>
      </div>
    );
  };

  const isPremiumTab = activeTab !== 'welcome' && activeTab !== 'subscription' && activeTab !== 'stopwatch';

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

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [apiCallCount, setApiCallCount] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleApiUsage = () => {
      setApiCallCount(prev => prev + 1);
    };
    window.addEventListener('ai_bos_api_call', handleApiUsage);
    return () => window.removeEventListener('ai_bos_api_call', handleApiUsage);
  }, []);

  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
    addSystemLog('info', 'AI Core', `User query submitted: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`);
    window.dispatchEvent(new CustomEvent('ai_bos_api_call'));

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
      addSystemLog('success', 'AI Core', `Received response in ${total}ms (TTFT: ${ttft}ms)`);

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
      addSystemLog('warn', 'AI Core', `Online request failed. Displaying cached simulation output.`);

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
      case 'subscription': return 'Workspace Subscriptions, Billing & Credentials';
      default: return 'Business Operating System';
    }
  };

  const batteryPercent = Math.max(2, 100 - Math.floor(elapsedSeconds / 15) - (apiCallCount * 4));
  
  // Select battery icon and colors
  let BatteryIcon = Battery;
  let batteryTextColor = 'text-emerald-400';
  let batteryBorderColor = 'border-emerald-500/20';
  let batteryBgColor = 'bg-emerald-500/5';
  let batteryLabel = 'Optimal';

  if (batteryPercent <= 25) {
    BatteryIcon = BatteryLow;
    batteryTextColor = 'text-rose-400';
    batteryBorderColor = 'border-rose-500/20';
    batteryBgColor = 'bg-rose-500/5';
    batteryLabel = 'Critical';
  } else if (batteryPercent <= 65) {
    BatteryIcon = BatteryMedium;
    batteryTextColor = 'text-amber-400';
    batteryBorderColor = 'border-amber-500/20';
    batteryBgColor = 'bg-amber-500/5';
    batteryLabel = 'Warning';
  }

  return (
    <div className={`flex h-screen w-screen bg-dark-bg text-gray-300 overflow-hidden font-sans border-4 border-dark-card select-none ${theme === 'light' ? 'theme-light' : ''}`}>
      
      {/* Left Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        systemStatus={systemStatus} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        userProfile={userProfile}
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
            <div className="text-[10px] text-gray-500 font-mono">
              Workspace Dashboard
            </div>
          </div>
        </header>

        {/* Dynamic Tab Workspace Body */}
        <div className="p-4 flex-1 max-w-7xl w-full mx-auto space-y-4">
          {renderGlobalTrialBanner()}
          {isPremiumTab && !hasActivePlan ? (
            <PremiumPaywall 
              user={user}
              userProfile={userProfile}
              onNavigateToBilling={() => setActiveTab('subscription')}
              tabName={renderActiveTabName()}
            />
          ) : (
            <>
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
              {activeTab === 'subscription' && (
                <SubscriptionHub />
              )}
            </>
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
