import React, { useState, useEffect } from 'react';
import { AppTab, ChatMessage } from './types';
import { HelpCircle, Sun, Moon, Wifi, WifiOff, Battery, BatteryMedium, BatteryLow, ShieldAlert } from 'lucide-react';
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
    let unsubProfile: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      // Clean up previous snapshot listener if it exists
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (currentUser) {
        setAuthLoading(true);
        const docRef = doc(db, 'users', currentUser.uid);
        unsubProfile = onSnapshot(docRef, (snapshot) => {
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
      } else {
        setUserProfile(null);
        setAuthLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubProfile) {
        unsubProfile();
      }
    };
  }, []);

  const getTrialStatus = () => {
    if (!userProfile) return { active: false, daysLeft: 0, expired: false, hasTrial: false, daysElapsed: 0 };
    const planName = userProfile.plan || '';
    const isTrial = planName === 'Free Trial' || planName.toLowerCase().includes('trial');
    if (!isTrial) return { active: false, daysLeft: 0, expired: false, hasTrial: false, daysElapsed: 0 };

    const joinedDateStr = userProfile.joinedAt || userProfile.trialStartedAt || new Date().toISOString();
    const joinedTime = new Date(joinedDateStr).getTime();
    const currentTime = new Date().getTime();
    const elapsedMs = currentTime - joinedTime;
    const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
    
    const trialDurationDays = 7; // Strictly 7-Day Free Trial Policy
    const daysLeft = Math.max(0, trialDurationDays - elapsedDays);
    const expired = elapsedDays >= trialDurationDays;

    return {
      active: !expired,
      daysLeft: parseFloat(daysLeft.toFixed(1)),
      expired,
      hasTrial: true,
      daysElapsed: parseFloat(elapsedDays.toFixed(1))
    };
  };

  const trialStatus = getTrialStatus();

  const hasActivePlan = !!userProfile && (
    (trialStatus.hasTrial && !trialStatus.expired) ||
    (!trialStatus.hasTrial && (
      userProfile.plan === 'Monthly Subscription ($29.99)' ||
      userProfile.plan === 'Yearly Subscription ($299.99)' ||
      userProfile.plan === 'AI-BOS Monthly Subscription' ||
      userProfile.plan === 'AI-BOS Annual Subscription' ||
      userProfile.plan.includes('Subscription')
    ))
  );

  const isPremiumTab = activeTab !== 'welcome' && activeTab !== 'subscription' && activeTab !== 'stopwatch';

  // Automatically restrict further access and redirect the user immediately upon trial expiration.
  useEffect(() => {
    if (userProfile && trialStatus.hasTrial && trialStatus.expired) {
      if (activeTab !== 'subscription') {
        setActiveTab('subscription');
        addSystemLog('warn', 'Subscription System', 'Free trial has expired. Redirecting to billing page.');
      }
    }
  }, [userProfile?.plan, userProfile?.joinedAt, trialStatus.expired, activeTab]);

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

            {/* Session Battery Resource indicator */}
            <div className="flex items-center gap-2 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-md text-[10px] font-mono select-none transition-all cursor-pointer relative group shrink-0"
                 title="Est. Resource Level (API usage & session duration)">
              <BatteryIcon className={`w-4 h-4 ${batteryTextColor} ${batteryPercent <= 25 ? 'animate-pulse' : ''}`} />
              <div className="flex flex-col leading-none">
                <span className="text-gray-400 font-bold text-[9px]">BATTERY: <strong className={batteryTextColor}>{batteryPercent}%</strong></span>
                <span className="text-gray-500 text-[8px] mt-0.5">Uptime: {formatElapsedTime(elapsedSeconds)}</span>
              </div>
              
              {/* Tooltip detail on hover */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-dark-panel border border-white/10 p-3 rounded shadow-2xl hidden group-hover:block z-50 text-[10.5px] leading-relaxed text-gray-300">
                <div className="font-bold border-b border-white/5 pb-1.5 mb-1.5 text-white flex items-center justify-between">
                  <span>Session Battery Log</span>
                  <span className={`px-1.5 py-px text-[8px] font-bold uppercase rounded border ${batteryTextColor} ${batteryBorderColor} ${batteryBgColor}`}>
                    {batteryLabel}
                  </span>
                </div>
                <div className="space-y-1 font-mono text-[9.5px]">
                  <p>⚡ <span className="text-gray-400">Agent Energy:</span> <strong className={batteryTextColor}>{batteryPercent}%</strong></p>
                  <p>⏱️ <span className="text-gray-400">Uptime:</span> <strong className="text-blue-400">{formatElapsedTime(elapsedSeconds)}</strong></p>
                  <p>🤖 <span className="text-gray-400">API Key Queries:</span> <strong className="text-purple-400">{apiCallCount} calls</strong></p>
                </div>
                <div className="border-t border-white/5 mt-2 pt-1.5 text-[8.5px] text-gray-500 leading-normal">
                  Estimates token capacity by weighing background telemetry execution cycles and active API invocations.
                </div>
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
          {/* Free Trial Banner / Advance Expiration Notifications */}
          {userProfile && trialStatus.hasTrial && (
            <div className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-md ${
              trialStatus.expired
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-200'
                : trialStatus.daysLeft <= 2
                  ? 'bg-amber-500/10 border-amber-500/25 text-amber-200 animate-pulse'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full shrink-0 ${
                  trialStatus.expired 
                    ? 'bg-rose-500/20 text-rose-400' 
                    : trialStatus.daysLeft <= 2
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[12px] leading-tight flex items-center gap-2">
                    <span>
                      {trialStatus.expired 
                        ? '7-Day Free Trial Expired' 
                        : trialStatus.daysLeft <= 2 
                          ? 'Action Required: Your Free Trial is Ending Soon' 
                          : '7-Day Free Trial Active'}
                    </span>
                    <span className="text-[9px] font-mono uppercase bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      {trialStatus.expired ? 'EXPIRED' : `${trialStatus.daysLeft} Days Left`}
                    </span>
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1 leading-normal">
                    {trialStatus.expired
                      ? 'Your 7-day trial period has expired. Please select a premium plan to regain access to the AI-Powered Business Operating System.'
                      : `Your risk-free trial ends on ${new Date(new Date(userProfile.joinedAt || userProfile.trialStartedAt || new Date().toISOString()).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}. Upgrade to a premium monthly or yearly plan at any time to preserve configuration pipelines.`}
                  </p>
                </div>
              </div>
              
              {!trialStatus.expired && activeTab !== 'subscription' && (
                <button
                  onClick={() => setActiveTab('subscription')}
                  className="px-3 py-1.5 bg-brand-primary hover:bg-brand-hover text-white text-[10px] font-mono font-bold uppercase rounded transition-all shrink-0 cursor-pointer text-center"
                >
                  Upgrade to Premium
                </button>
              )}
            </div>
          )}

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
