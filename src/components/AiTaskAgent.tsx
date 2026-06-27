import React, { useState } from 'react';
import { 
  Cpu, 
  Play, 
  Settings, 
  Pause, 
  Plus, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  History
} from 'lucide-react';

interface Task {
  id: string;
  name: string;
  trigger: string;
  model: string;
  status: 'idle' | 'running' | 'completed' | 'paused';
  lastRun: string;
}

export default function AiTaskAgent() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', name: 'Auto-Qualify Inbound Leads', trigger: 'On Lead Registration', model: 'gemini-3.1-pro-preview', status: 'idle', lastRun: '15 mins ago' },
    { id: '2', name: 'Generate Weekly LinkedIn Ad Variants', trigger: 'Every Monday 8:00 AM', model: 'gemini-3.5-flash', status: 'paused', lastRun: '4 days ago' },
    { id: '3', name: 'Reconcile QuickBooks Invoices', trigger: 'Daily 11:30 PM', model: 'gemini-3.1-pro-preview', status: 'completed', lastRun: '8 hours ago' },
    { id: '4', name: 'SOP Document Alignment Scan', trigger: 'On Document Upload', model: 'gemini-3.5-flash', status: 'idle', lastRun: 'Yesterday' }
  ]);

  const [activeLogs, setActiveLogs] = useState<string[]>([
    '[INIT] Task Agent background scheduler bound to Redis queue.',
    '[MONITOR] Listening for webhook events...'
  ]);
  const [isExecuting, setIsExecuting] = useState(false);

  const runTaskNow = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'running' } : t));
    setIsExecuting(true);
    setActiveLogs(prev => [...prev, `[TRIGGER] Initiated task manually: "${task.name}" using ${task.model}...`]);

    setTimeout(() => {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed', lastRun: 'Just now' } : t));
      setIsExecuting(false);
      setActiveLogs(prev => [
        ...prev,
        `[SPAWN] Model instance created for ${task.model}.`,
        `[ANALYSIS] Prompt mapping: "Trigger global lead scoring evaluation on input stream."`,
        `[SUCCESS] "${task.name}" successfully executed. 14 items updated inside database context.`
      ]);
    }, 1500);
  };

  const togglePauseTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      status: t.status === 'paused' ? 'idle' : 'paused'
    } : t));
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Title block */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div>
          <h2 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <span className="p-1 bg-purple-500/10 rounded border border-purple-500/20 text-purple-400">
              <Cpu className="w-4 h-4 animate-spin-slow" />
            </span>
            AI Task Agent
          </h2>
          <p className="text-[10px] text-gray-500">Configure background cron schedules and webhook triggers mapping directly to Gemini LLM nodes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Task Cards list (7 cols) */}
        <div className="lg:col-span-7 space-y-2.5 h-[400px] overflow-y-auto pr-1">
          {tasks.map((task) => {
            return (
              <div key={task.id} className="bg-dark-panel border border-white/5 rounded-lg p-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      task.status === 'running' ? 'bg-amber-400 animate-ping' :
                      task.status === 'completed' ? 'bg-emerald-500' :
                      task.status === 'paused' ? 'bg-gray-600' : 'bg-blue-400'
                    }`} />
                    <h3 className="text-xs font-bold text-white">{task.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-[9px] font-mono text-gray-500 pt-0.5">
                    <span>Trigger: <strong className="text-gray-400">{task.trigger}</strong></span>
                    <span>•</span>
                    <span>Model: <strong className="text-purple-400">{task.model}</strong></span>
                    <span>•</span>
                    <span>Last Run: <strong className="text-gray-400">{task.lastRun}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                  <button
                    onClick={() => togglePauseTask(task.id)}
                    className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-gray-400 hover:text-white transition-all cursor-pointer text-[10px] uppercase font-mono font-bold"
                  >
                    {task.status === 'paused' ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    onClick={() => runTaskNow(task.id)}
                    disabled={isExecuting || task.status === 'paused'}
                    className="bg-brand-primary hover:bg-brand-hover disabled:opacity-40 text-white rounded px-2.5 py-1.5 text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Run Now</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live background logger terminal (5 cols) */}
        <div className="lg:col-span-5 bg-black/80 rounded-lg border border-white/10 p-3.5 flex flex-col h-[400px]">
          <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2 font-mono text-[9px] text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping" />
              <span>AI_AGENT_SCHEDULER LOGS</span>
            </span>
            <button
              onClick={() => setActiveLogs(['[CLEAR] Logs buffer flushed. Agent runner active.'])}
              className="text-[8px] uppercase font-mono tracking-wider text-purple-400 hover:text-purple-300"
            >
              Clear
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[10px] text-purple-400 scrollbar-thin">
            {activeLogs.map((log, index) => (
              <pre key={index} className="whitespace-pre-wrap leading-relaxed break-all">
                {log}
              </pre>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center text-[9px] font-mono text-gray-500">
            <span>THREAD POOL: 8 worker threads</span>
            <span className="text-emerald-400 uppercase font-bold">● IDLE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
