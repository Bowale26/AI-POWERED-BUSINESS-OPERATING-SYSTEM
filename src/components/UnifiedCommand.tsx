import React, { useState } from 'react';
import { 
  Terminal as TerminalIcon, 
  Play, 
  Send, 
  Activity, 
  Zap, 
  Cpu, 
  Server, 
  Database, 
  ShieldCheck, 
  RefreshCw 
} from 'lucide-react';

interface UnifiedCommandProps {
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
}

export default function UnifiedCommand({ onSendMessage, isLoading }: UnifiedCommandProps) {
  const [commandInput, setCommandInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[INIT] AI-BOS Command Center online.',
    '[SYSTEM] Operational efficiency is at 98.4%. All API endpoints verified.',
    '[TELEMETRY] Proactive latency monitoring active on US-WEST2 region.',
    'Select a command block below or type /command to dispatch global directives.'
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [globalDirective, setGlobalDirective] = useState('Enforce strict corporate alignment, prioritize lead conversion value, and minimize outreach latency.');

  const runCommand = async (command: string) => {
    setIsExecuting(true);
    setTerminalLogs(prev => [...prev, `[COMMAND] Dispatching: ${command}...`]);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: command, tab: 'command' })
      });
      const data = await response.json();
      setTerminalLogs(prev => [
        ...prev, 
        `[RESPONSE] Received from AI Core:\n${data.text}`,
        `[SUCCESS] Command execution completed.`
      ]);
    } catch (e) {
      setTerminalLogs(prev => [...prev, `[ERROR] Failed to run command: Simulated fallback triggered.`]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSendCustomCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    const cmd = commandInput;
    setCommandInput('');
    runCommand(cmd);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-3 gap-2">
        <div>
          <h2 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <span className="p-1 bg-amber-500/10 rounded border border-amber-500/20 text-amber-400">
              <TerminalIcon className="w-4 h-4 animate-pulse" />
            </span>
            Unified Command Center
          </h2>
          <p className="text-[10px] text-gray-500">Global operating desk for triggering core operational blueprints and pipeline instructions.</p>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-mono text-gray-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Session Code:</span>
          <span className="text-amber-400 font-bold">UCC-SECURE-99</span>
        </div>
      </div>

      {/* Grid of Telemetry */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'System Load', value: '42%', icon: Cpu, color: 'text-purple-400', desc: 'SaaS Container Cores' },
          { label: 'API Latency', value: '85ms', icon: Activity, color: 'text-blue-400', desc: 'Average Response' },
          { label: 'DB Connections', value: '18 Active', icon: Database, color: 'text-emerald-400', desc: 'PostgreSQL Pool' },
          { label: 'Security State', value: 'Hardened', icon: ShieldCheck, color: 'text-amber-400', desc: 'Audit verified' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-dark-panel border border-white/5 p-3 rounded-lg flex items-center gap-3">
              <div className={`p-2 rounded bg-white/5 ${stat.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase font-mono font-bold tracking-wider">{stat.label}</p>
                <p className="text-xs font-bold text-white mt-0.5">{stat.value}</p>
                <p className="text-[8px] text-gray-500 truncate">{stat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Directive Card */}
      <div className="bg-gradient-to-r from-purple-950/40 via-dark-panel to-amber-950/20 border border-white/5 p-4 rounded-lg space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Global CRM Directive</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-9">
            <textarea
              value={globalDirective}
              onChange={(e) => setGlobalDirective(e.target.value)}
              className="w-full bg-dark-bg/80 border border-white/10 rounded p-2 text-[11px] font-mono text-amber-300 focus:border-amber-400 outline-none h-16 resize-none leading-relaxed"
              placeholder="Inject raw prompt rules across all sub-agents..."
            />
          </div>
          <div className="md:col-span-3">
            <button
              onClick={() => runCommand(`Incorporate global directive: "${globalDirective}". Verify alignment and update CRM model preferences.`)}
              disabled={isExecuting}
              className="w-full h-16 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded cursor-pointer flex flex-col justify-center items-center gap-1 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isExecuting ? 'animate-spin' : ''}`} />
              <span className="text-[10px]">Propagate Rules</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Terminal output */}
        <div className="lg:col-span-8 flex flex-col bg-black/80 rounded-lg border border-white/10 p-3 h-80">
          <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2 font-mono text-[9px] text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
              <span>LIVE CORE_SYSTEM_AGENT LOGSTREAM</span>
            </span>
            <span>UTF-8</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[10px] text-emerald-400 scrollbar-thin">
            {terminalLogs.map((log, index) => (
              <pre key={index} className="whitespace-pre-wrap leading-relaxed break-all">
                {log}
              </pre>
            ))}
          </div>
          <form onSubmit={handleSendCustomCommand} className="mt-2.5 flex gap-2 border-t border-white/10 pt-2.5">
            <span className="text-amber-400 font-mono text-xs pt-1.5">BOS_CMD$</span>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Type system commands (e.g. /strategy, /growth, /ops)..."
              className="flex-1 bg-transparent text-[11px] font-mono text-white outline-none placeholder-gray-600"
              disabled={isExecuting}
            />
            <button
              type="submit"
              disabled={isExecuting || !commandInput.trim()}
              className="bg-white/5 hover:bg-white/10 text-white rounded p-1.5 cursor-pointer disabled:opacity-40 transition-all shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Global Blueprint buttons */}
        <div className="lg:col-span-4 bg-dark-panel rounded-lg border border-white/5 p-4 space-y-3 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-2">Operational Blueprints</h4>
            <p className="text-[10px] text-gray-500 mb-4">Run predefined, highly analytical micro-routines to score metrics, generate alignment OKRs, and configure SaaS nodes.</p>
            <div className="space-y-2">
              {[
                { label: 'Strategic Alignment', cmd: '/strategy', desc: 'Formulate Q3 OKR and KPI targets' },
                { label: 'Process Mapping', cmd: '/ops', desc: 'Model automation triggers' },
                { label: 'Marketing Growth', cmd: '/growth', desc: 'Evaluate LinkedIn/Google campaign splits' },
                { label: 'Finance Assessment', cmd: '/finance', desc: 'Score risk parameters and margins' }
              ].map((bp, i) => (
                <button
                  key={i}
                  onClick={() => runCommand(bp.cmd)}
                  disabled={isExecuting}
                  className="w-full bg-dark-bg/60 hover:bg-white/5 border border-white/10 rounded p-2.5 flex items-center justify-between transition-all text-left cursor-pointer group"
                >
                  <div>
                    <p className="text-xs font-bold text-white font-mono group-hover:text-amber-400 transition-colors">{bp.cmd}</p>
                    <p className="text-[9px] text-gray-500 mt-0.5">{bp.desc}</p>
                  </div>
                  <Play className="w-3 h-3 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setTerminalLogs(['[CLEAR] Logs flushed successfully. Command Center initialized.'])}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded py-1.5 text-[10px] font-mono tracking-wider uppercase cursor-pointer"
          >
            Clear Terminal Buffer
          </button>
        </div>
      </div>
    </div>
  );
}
